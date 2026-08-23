import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:bitemate/data/repositories/health_repository_impl.dart';
import 'package:bitemate/domain/entities/health_status.dart';
import 'package:bitemate/presentation/screens/home/home_controller.dart';
import 'package:bitemate/domain/repositories/health_repository.dart';

class _FakeHealthRepository implements HealthRepository {
  @override
  Future<HealthStatus> getHealthStatus() async {
    return const HealthStatus(status: 'ok');
  }
}

void main() {
  test('homeControllerProvider returns health status', () async {
    final container = ProviderContainer(
      overrides: [
        healthRepositoryProvider.overrideWithValue(_FakeHealthRepository()),
      ],
    );
    addTearDown(container.dispose);

    final status = await container.read(homeControllerProvider.future);
    expect(status.status, 'ok');
  });
}
