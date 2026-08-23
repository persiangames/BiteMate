import 'package:equatable/equatable.dart';

class HealthStatus extends Equatable {
  const HealthStatus({required this.status});

  final String status;

  @override
  List<Object?> get props => [status];
}
