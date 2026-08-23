import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/health_status.dart';
import '../../domain/repositories/health_repository.dart';
import '../datasources/health_remote_data_source.dart';
import '../datasources/health_remote_data_source_impl.dart';

final healthRepositoryProvider = Provider<HealthRepository>((ref) {
  return HealthRepositoryImpl(ref.watch(healthRemoteDataSourceProvider));
});

class HealthRepositoryImpl implements HealthRepository {
  const HealthRepositoryImpl(this._remoteDataSource);

  final HealthRemoteDataSource _remoteDataSource;

  @override
  Future<HealthStatus> getHealthStatus() {
    return _remoteDataSource.fetchHealthStatus();
  }
}
