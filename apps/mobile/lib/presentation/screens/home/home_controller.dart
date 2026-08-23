import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../data/repositories/health_repository_impl.dart';
import '../../../domain/entities/health_status.dart';

final homeControllerProvider = FutureProvider<HealthStatus>((ref) async {
  final repository = ref.watch(healthRepositoryProvider);
  return repository.getHealthStatus();
});
