import 'package:flutter/material.dart';

class EventReviewsScreen extends StatelessWidget {
  const EventReviewsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Event Reviews')),
      body: ListView(
        padding: const EdgeInsets.all(18),
        children: [
          Text('Rate the experience', style: Theme.of(context).textTheme.titleLarge),
          const SizedBox(height: 12),
          Row(
            children: List.generate(5, (index) => const Icon(Icons.star_border, size: 34)),
          ),
          const SizedBox(height: 16),
          const TextField(
            maxLines: 4,
            decoration: InputDecoration(labelText: 'Leave a comment'),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: null,
            icon: Icon(Icons.upload_outlined),
            label: Text('Upload Photos or Videos'),
          ),
        ],
      ),
    );
  }
}
