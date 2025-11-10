/**
 * Loading UI
 *
 * Global loading state shown during page transitions and data fetching.
 * Uses ThunderLaunch-themed spinner with lightning bolt animation.
 */

import { ThunderSpinner } from '@/components/ui/LoadingSpinner';
import { Container } from '@/components/layout';

export default function Loading() {
  return (
    <Container centerY>
      <ThunderSpinner
        size="lg"
        text="Loading..."
      />
    </Container>
  );
}
