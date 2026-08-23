import '../../domain/entities/health_status.dart';

class HealthStatusModel {
  const HealthStatusModel({required this.status});

  final String status;

  factory HealthStatusModel.fromJson(Map<String, dynamic> json) {
    return HealthStatusModel(status: json['status'] as String);
  }

  HealthStatus toEntity() => HealthStatus(status: status);
}
