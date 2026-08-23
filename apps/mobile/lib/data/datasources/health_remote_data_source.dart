import '../../domain/entities/health_status.dart';

abstract class HealthRemoteDataSource {
  Future<HealthStatus> fetchHealthStatus();
}
