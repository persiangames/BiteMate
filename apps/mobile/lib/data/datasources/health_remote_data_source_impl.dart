import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/dio_provider.dart';
import '../../domain/entities/health_status.dart';
import '../models/health_status_model.dart';
import 'health_remote_data_source.dart';

final healthRemoteDataSourceProvider = Provider<HealthRemoteDataSource>((ref) {
  return HealthRemoteDataSourceImpl(ref.watch(dioProvider));
});

class HealthRemoteDataSourceImpl implements HealthRemoteDataSource {
  const HealthRemoteDataSourceImpl(this._dio);

  final Dio _dio;

  @override
  Future<HealthStatus> fetchHealthStatus() async {
    final response = await _dio.get<Map<String, dynamic>>('/health');
    return HealthStatusModel.fromJson(response.data!).toEntity();
  }
}
