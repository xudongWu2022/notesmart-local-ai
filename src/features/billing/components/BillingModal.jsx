import { useTranslation } from 'react-i18next';
import { Dialog } from '@headlessui/react';
import { FiX } from 'react-icons/fi';
import { useState } from 'react';

function BillingModal({ isOpen, onClose }) {
  const { t } = useTranslation();
  const [billingInterval, setBillingInterval] = useState('annually');

  const plans = [
    {
      name: 'Free',
      price: '$0.00',
      interval: '/month',
      features: [
        '10 Notes in Total',
        'Max 15 minutes recording / note',
        '5 test predictions / note',
        '1 note source / note',
        '5MB / DOC',
        '100MB / Audio'
      ]
    },
    {
      name: 'Plus',
      price: '$5.00',
      interval: '/month',
      popular: true,
      features: [
        '25 Notes / month',
        'Max 120 minutes recording / note',
        'Unlimited test predictions',
        '10 note source / note',
        '30MB / DOC',
        '500MB / Audio',
        'Export to PDF'
      ]
    },
    {
      name: 'Pro',
      price: '$8.00',
      interval: '/month',
      features: [
        'Unlimited notes',
        'Max 240 minutes recording / note',
        'Unlimited test predictions',
        '20 note source / note',
        '100MB / DOC',
        '500MB / Audio',
        'Export to PDF',
        'Priority support',
        'Advanced voice model'
      ]
    }
  ];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

        <div className="relative bg-surface-card rounded-xl shadow-xl border border-border-subtle max-w-4xl w-full mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <Dialog.Title className="text-xl font-semibold text-content-primary">
              {t('settings.subscriptionPlans')}
            </Dialog.Title>
            <button
              onClick={onClose}
              className="p-2 hover:bg-surface-hover rounded-full text-content-secondary transition-colors"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Billing Interval Toggle */}
            <div className="flex justify-center space-x-2 mb-8">
              {['annually', 'monthly', 'weekly'].map((interval) => (
                <button
                  key={interval}
                  className={`px-4 py-2 rounded-full capitalize transition-colors ${
                    billingInterval === interval
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600'
                      : 'text-content-secondary hover:bg-surface-hover'
                  }`}
                  onClick={() => setBillingInterval(interval)}
                >
                  {interval.charAt(0).toUpperCase() + interval.slice(1)}
                </button>
              ))}
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`
                    relative p-6 rounded-xl border
                    ${plan.popular
                      ? 'border-primary-500 shadow-sm'
                      : 'border-border'}
                  `}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs px-3 py-1 rounded-full">
                      {t('settings.popular')}
                    </span>
                  )}
                  <h3 className="text-lg font-semibold mb-2 text-content-primary">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-content-primary">{plan.price}</span>
                    <span className="text-content-secondary">{plan.interval}</span>
                  </div>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-content-secondary">
                        <svg className="h-5 w-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className={`
                    mt-6 w-full py-2 px-4 rounded-lg transition-colors
                    ${plan.popular
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'border border-border text-content-secondary hover:bg-surface-hover'
                    }
                  `}>
                    {plan.name === 'Free' ? 'Current Plan' : `Go ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default BillingModal;
