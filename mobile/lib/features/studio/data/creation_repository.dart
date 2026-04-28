// ─────────────────────────────────────────────────────────────────────────────
// Creation Repository — calls backend API.
// Mock engine for V1: structure is complete, providers connect later.
// ─────────────────────────────────────────────────────────────────────────────

import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';

class CreationJobModel {
  final String jobId;
  final String type;
  final String status;
  final String? provider;
  final Map<String, dynamic> params;
  final int creditsUsed;
  final String? resultUrl;
  final String? error;
  final String createdAt;

  const CreationJobModel({
    required this.jobId,
    required this.type,
    required this.status,
    this.provider,
    required this.params,
    required this.creditsUsed,
    this.resultUrl,
    this.error,
    required this.createdAt,
  });

  factory CreationJobModel.fromJson(Map<String, dynamic> json) => CreationJobModel(
    jobId:       json['job_id'],
    type:        json['type'],
    status:      json['status'],
    provider:    json['provider'],
    params:      Map<String, dynamic>.from(json['params'] ?? {}),
    creditsUsed: json['credits_used'] ?? 0,
    resultUrl:   json['result_url'],
    error:       json['error'],
    createdAt:   json['created_at'] ?? '',
  );

  bool get isCompleted  => status == 'completed';
  bool get isProcessing => status == 'processing' || status == 'queued';
  bool get isFailed     => status == 'failed';
}

class CreationRepository {
  final Dio _dio;
  CreationRepository(this._dio);

  Future<CreationJobModel> createMusicJob({
    required String prompt,
    required String style,
    required int duration,
    bool instrumental = false,
  }) async {
    final resp = await _dio.post('/api/create/music', data: {
      'prompt':       prompt,
      'style':        style,
      'duration':     duration,
      'instrumental': instrumental,
    });
    return CreationJobModel.fromJson(resp.data);
  }

  Future<CreationJobModel> createImageJob({
    required String prompt,
    String style = 'cinematic',
    int width  = 1024,
    int height = 1024,
  }) async {
    final resp = await _dio.post('/api/create/image', data: {
      'prompt': prompt,
      'style':  style,
      'width':  width,
      'height': height,
    });
    return CreationJobModel.fromJson(resp.data);
  }

  Future<CreationJobModel> getJobStatus(String jobId) async {
    final resp = await _dio.get('/api/create/status/$jobId');
    return CreationJobModel.fromJson(resp.data);
  }

  Future<List<CreationJobModel>> getHistory({int limit = 20}) async {
    final resp = await _dio.get('/api/create/history', queryParameters: {'limit': limit});
    final items = resp.data['items'] as List;
    return items.map((j) => CreationJobModel.fromJson(j)).toList();
  }
}

// ── Providers ─────────────────────────────────────────────────────────────────
final creationRepositoryProvider = Provider<CreationRepository>((ref) {
  return CreationRepository(ref.watch(dioProvider));
});

final creationJobsProvider = FutureProvider<List<CreationJobModel>>((ref) async {
  return ref.watch(creationRepositoryProvider).getHistory();
});

// Wallet balance provider (used in Studio app bar)
final walletBalanceProvider = FutureProvider<int>((ref) async {
  final dio = ref.watch(dioProvider);
  final resp = await dio.get('/api/user/wallet');
  return resp.data['balance'] as int;
});
