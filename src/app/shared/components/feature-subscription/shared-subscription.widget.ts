export type ButtonMode = 'FAB' | 'BUTTON' | 'COMPACT';

export abstract class SharedSubscriptionButtonComponent {
  abstract buttonMode(): ButtonMode;

  abstract follow(): void;

  abstract unfollow(): void;
}
