// ─────────────────────────────────────────────────────────────────────────────
// Auth Feature — Repository + Riverpod providers
// ─────────────────────────────────────────────────────────────────────────────

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/storage/secure_storage.dart';

// ── Models ────────────────────────────────────────────────────────────────────
class AuthUser {
  final String id;
  final String email;
  final String username;
  final String displayName;
  final String role;
  final bool isVerified;
  final bool totpEnabled;
  final String? avatarUrl;

  const AuthUser({
    required this.id,
    required this.email,
    required this.username,
    required this.displayName,
    required this.role,
    required this.isVerified,
    required this.totpEnabled,
    this.avatarUrl,
  });

  factory AuthUser.fromJson(Map<String, dynamic> json) => AuthUser(
    id:          json['id'],
    email:       json['email'],
    username:    json['username'],
    displayName: json['display_name'] ?? json['username'],
    role:        json['role'],
    isVerified:  json['is_verified'] ?? false,
    totpEnabled: json['totp_enabled'] ?? false,
    avatarUrl:   json['avatar_url'],
  );

  bool get isAdmin => role == 'admin' || role == 'super_admin';
  bool get isPro   => role == 'pro' || role == 'label' || isAdmin;
}

// ── Repository ────────────────────────────────────────────────────────────────
class AuthRepository {
  final Dio _dio;
  final SecureStorageService _storage;

  AuthRepository(this._dio, this._storage);

  Future<AuthUser> login({
    required String email,
    required String password,
    String? totpCode,
  }) async {
    final resp = await _dio.post('/api/auth/login', data: {
      'email':     email,
      'password':  password,
      if (totpCode != null) 'totp_code': totpCode,
    });

    final data = resp.data as Map<String, dynamic>;
    await _storage.saveTokens(
      accessToken:  data['access_token'],
      refreshToken: data['refresh_token'],
    );
    await _storage.saveSession(
      userId: data['user_id'],
      role:   data['role'],
    );

    // Fetch full profile
    return getMe();
  }

  Future<void> register({
    required String email,
    required String username,
    required String password,
    String? displayName,
  }) async {
    await _dio.post('/api/auth/register', data: {
      'email':        email,
      'username':     username,
      'password':     password,
      'display_name': displayName ?? username,
    });
  }

  Future<AuthUser> getMe() async {
    final resp = await _dio.get('/api/auth/me');
    return AuthUser.fromJson(resp.data);
  }

  Future<void> logout() async {
    try {
      await _dio.post('/api/auth/logout');
    } catch (_) {}
    await _storage.clearSession();
  }

  Future<void> verifyEmail(String token) async {
    await _dio.get('/api/auth/verify/$token');
  }

  Future<void> forgotPassword(String email) async {
    await _dio.post('/api/auth/forgot-password', data: {'email': email});
  }
}

// ── Providers ─────────────────────────────────────────────────────────────────
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    ref.watch(dioProvider),
    ref.watch(secureStorageProvider),
  );
});

// Auth state
sealed class AuthState {
  const AuthState();
}
class AuthInitial     extends AuthState { const AuthInitial(); }
class AuthLoading     extends AuthState { const AuthLoading(); }
class AuthAuthenticated extends AuthState {
  final AuthUser user;
  const AuthAuthenticated(this.user);
}
class AuthUnauthenticated extends AuthState { const AuthUnauthenticated(); }
class AuthError       extends AuthState {
  final String message;
  const AuthError(this.message);
}

class AuthNotifier extends Notifier<AuthState> {
  @override
  AuthState build() {
    _checkSession();
    return const AuthInitial();
  }

  AuthRepository get _repo => ref.read(authRepositoryProvider);

  Future<void> _checkSession() async {
    final isLoggedIn = await ref.read(secureStorageProvider).isLoggedIn();
    if (!isLoggedIn) {
      state = const AuthUnauthenticated();
      return;
    }
    try {
      final user = await _repo.getMe();
      state = AuthAuthenticated(user);
    } catch (_) {
      state = const AuthUnauthenticated();
    }
  }

  Future<void> login({
    required String email,
    required String password,
    String? totpCode,
  }) async {
    state = const AuthLoading();
    try {
      final user = await _repo.login(
        email: email,
        password: password,
        totpCode: totpCode,
      );
      state = AuthAuthenticated(user);
    } on DioException catch (e) {
      final err = e.error;
      state = AuthError(err is ApiException ? err.message : 'Login failed');
    }
  }

  Future<bool> register({
    required String email,
    required String username,
    required String password,
    String? displayName,
  }) async {
    state = const AuthLoading();
    try {
      await _repo.register(
        email: email,
        username: username,
        password: password,
        displayName: displayName,
      );
      state = const AuthUnauthenticated();
      return true;
    } on DioException catch (e) {
      final err = e.error;
      state = AuthError(err is ApiException ? err.message : 'Registration failed');
      return false;
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AuthUnauthenticated();
  }

  AuthUser? get currentUser =>
      state is AuthAuthenticated ? (state as AuthAuthenticated).user : null;
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(AuthNotifier.new);

// Convenient derived providers
final currentUserProvider = Provider<AuthUser?>((ref) {
  final auth = ref.watch(authProvider);
  return auth is AuthAuthenticated ? auth.user : null;
});

final isLoggedInProvider = Provider<bool>((ref) {
  return ref.watch(authProvider) is AuthAuthenticated;
});
