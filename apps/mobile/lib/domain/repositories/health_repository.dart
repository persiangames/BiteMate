import '../entities/health_status.dart';

abstract class HealthRepository {
  Future<HealthStatus> getHealthStatus();
}
