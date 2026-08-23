import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../domain/entities/health_status.dart';
import '../home/home_controller.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final healthAsync = ref.watch(homeControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('BiteMate'),
        centerTitle: true,
      ),
      body: Center(
        child: healthAsync.when(
          data: (HealthStatus status) => Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.check_circle_outline,
                size: 48,
                color: Theme.of(context).colorScheme.primary,
              ),
              const SizedBox(height: 16),
              Text(
                'API Status: ${status.status}',
                style: Theme.of(context).textTheme.titleMedium,
              ),
            ],
          ),
          loading: () => const CircularProgressIndicator(),
          error: (error, _) => Text('Connection error: $error'),
        ),
      ),
    );
  }
}
