import { PricingCard } from '../components/PricingCard';
import { SUBSCRIPTION_PLANS } from '../lib/plans';

export default function PricingPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-blue-600">Pricing</h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Choose your plan
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Select the plan that best fits your journaling needs
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-4xl lg:grid-cols-2">
          <PricingCard
            name={SUBSCRIPTION_PLANS.monthly.name}
            price={`$${SUBSCRIPTION_PLANS.monthly.priceInCents / 100}`}
            period="month"
            description={SUBSCRIPTION_PLANS.monthly.description}
            features={SUBSCRIPTION_PLANS.monthly.features}
            buttonText={SUBSCRIPTION_PLANS.monthly.buttonText}
            buttonVariant={SUBSCRIPTION_PLANS.monthly.buttonVariant}
            plan="monthly"
          />
          <PricingCard
            name={SUBSCRIPTION_PLANS.yearly.name}
            price={`$${SUBSCRIPTION_PLANS.yearly.priceInCents / 100}`}
            period="year"
            description={SUBSCRIPTION_PLANS.yearly.description}
            features={SUBSCRIPTION_PLANS.yearly.features}
            buttonText={SUBSCRIPTION_PLANS.yearly.buttonText}
            buttonVariant={SUBSCRIPTION_PLANS.yearly.buttonVariant}
            plan="yearly"
            badge={SUBSCRIPTION_PLANS.yearly.badge}
          />
        </div>
      </div>
    </div>
  );
} 