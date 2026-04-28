// ─────────────────────────────────────────────────────────────────────────────
// Network Layer — Dio client with auth interceptor + error handling.
// All API calls go through here. Never use http package directly.
// ─────────────────────────────────────────────────────────────────────────────

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../storage/secure_storage.dart';

// ── Environment config ────────────────────────────────────────────────────────
class ApiConfig {
  static const String _prodBase    = 'https://api.genaudius.com';
  static const String _stagingBase = 'https://staging-api.genaudius.com';
  static const String _devBase     = 'http://localhost:8000';

  // Change this via --dart-define=ENV=production at build time
  static const String env = String.fromEnvironment('ENV', defaultValue: 'development');

  static String get baseUrl {
    switch (env) {
      case 'production': return _prodBase;
      case 'staging':    return _stagingBase;
      default:           return _devBase;
    }
  }
}

// ── Custom exceptions ─────────────────────────────────────────────────────────
class ApiException implements Exception {
  final int statusCode;
  final String message;
  final String? code;

  const ApiException({required this.statusCode, required this.message, this.code});

  @override
  String toString() => 'ApiException($statusCode): $message';

  bool get isUnauthorized  => statusCode == 401;
  bool get isForbidden     => statusCode == 403;
  bool get isNotFound      => statusCode == 404;
  bool get isServerError   => statusCode >= 500;
  bool get isNetworkError  => statusCode == 0;
  bool get isInsufficientCredits => statusCode == 402;
}

// ── Auth interceptor ──────────────────────────────────────────────────────────
class AuthInterceptor extends Interceptor {
  final SecureStorageService _storage;
  final Dio _dio;

  AuthInterceptor(this._storage, this._dio);

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await _storage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      // Try refresh
      try {
        final refreshed = await _refreshToken();
        if (refreshed) {
          // Retry the original request
          final token = await _storage.getAccessToken();
          err.requestOptions.headers['Authorization'] = 'Bearer $token';
          final response = await _dio.fetch(err.requestOptions);
          return handler.resolve(response);
        }
      } catch (_) {}

      // Refresh failed — clear session and redirect to login
      await _storage.clearSession();
      // AuthNotifier will detect empty storage and redirect
    }
    handler.next(err);
  }

  Future<bool> _refreshToken() async {
    final refreshToken = await _storage.getRefreshToken();
    if (refreshToken == null) return false;

    final response = await Dio().post(
      '${ApiConfig.baseUrl}/api/auth/refresh',
      data: {'refresh_token': refreshToken},
    );

    if (response.statusCode == 200) {
      await _storage.saveTokens(
        accessToken: response.data['access_token'],
        refreshToken: response.data['refresh_token'],
      );
      return true;
    }
    return false;
  }
}

// ── Error interceptor ─────────────────────────────────────────────────────────
class ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    final statusCode = err.response?.statusCode ?? 0;
    final data = err.response?.data;
    final message = data is Map ? (data['detail'] ?? 'Unknown error') : 'Network error';

    handler.reject(
      DioException(
        requestOptions: err.requestOptions,
        error: ApiException(
          statusCode: statusCode,
          message: message.toString(),
        ),
        response: err.response,
        type: err.type,
      ),
    );
  }
}

// ── Logging interceptor (dev only) ────────────────────────────────────────────
class LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    print('→ ${options.method} ${options.path}');
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    print('← ${response.statusCode} ${response.requestOptions.path}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    print('✗ ${err.response?.statusCode} ${err.requestOptions.path}: ${err.error}');
    handler.next(err);
  }
}

// ── Dio factory ───────────────────────────────────────────────────────────────
Dio createDio(SecureStorageService storage) {
  final dio = Dio(
    BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 60),
      sendTimeout: const Duration(seconds: 30),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-App-Platform': 'mobile',
        'X-App-Version': '1.0.0',
      },
    ),
  );

  dio.interceptors.addAll([
    AuthInterceptor(storage, dio),
    ErrorInterceptor(),
    if (ApiConfig.env == 'development') LoggingInterceptor(),
  ]);

  return dio;
}

// ── Riverpod provider ─────────────────────────────────────────────────────────
final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(secureStorageProvider);
  return createDio(storage);
});
