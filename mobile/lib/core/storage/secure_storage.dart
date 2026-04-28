// ─────────────────────────────────────────────────────────────────────────────
// Secure Storage — JWT tokens, session data.
// Uses Keychain (iOS) and EncryptedSharedPreferences (Android).
// NEVER store tokens in SharedPreferences plain text.
// ─────────────────────────────────────────────────────────────────────────────

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class _Keys {
  static const accessToken  = 'ga_access_token';
  static const refreshToken = 'ga_refresh_token';
  static const userId       = 'ga_user_id';
  static const userRole     = 'ga_user_role';
  static const biometricEnabled = 'ga_biometric';
}

class SecureStorageService {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  // ── Tokens ────────────────────────────────────────────────────────────────
  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await Future.wait([
      _storage.write(key: _Keys.accessToken, value: accessToken),
      _storage.write(key: _Keys.refreshToken, value: refreshToken),
    ]);
  }

  Future<String?> getAccessToken()  => _storage.read(key: _Keys.accessToken);
  Future<String?> getRefreshToken() => _storage.read(key: _Keys.refreshToken);

  // ── Session ───────────────────────────────────────────────────────────────
  Future<void> saveSession({
    required String userId,
    required String role,
  }) async {
    await Future.wait([
      _storage.write(key: _Keys.userId, value: userId),
      _storage.write(key: _Keys.userRole, value: role),
    ]);
  }

  Future<String?> getUserId()   => _storage.read(key: _Keys.userId);
  Future<String?> getUserRole() => _storage.read(key: _Keys.userRole);

  // ── Biometric ─────────────────────────────────────────────────────────────
  Future<bool> isBiometricEnabled() async {
    final val = await _storage.read(key: _Keys.biometricEnabled);
    return val == 'true';
  }

  Future<void> setBiometricEnabled(bool enabled) =>
      _storage.write(key: _Keys.biometricEnabled, value: enabled.toString());

  // ── Auth state ────────────────────────────────────────────────────────────
  Future<bool> isLoggedIn() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }

  Future<void> clearSession() async {
    await Future.wait([
      _storage.delete(key: _Keys.accessToken),
      _storage.delete(key: _Keys.refreshToken),
      _storage.delete(key: _Keys.userId),
      _storage.delete(key: _Keys.userRole),
    ]);
  }
}

// ── Provider ──────────────────────────────────────────────────────────────────
final secureStorageProvider = Provider<SecureStorageService>(
  (_) => SecureStorageService(),
);
