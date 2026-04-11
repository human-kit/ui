export const users = [
	{ id: 'danilo', email: 'danilo.fernandez+workspace-owner@example.com', group: 'Developer' },
	{ id: 'zahra', email: 'zahra@example.com', group: 'Admin' },
	{
		id: 'jasper',
		email: 'jasper.with-a-very-long-email-address@example.com',
		group: 'Developer'
	},
	{ id: 'marta', email: 'marta@example.com', group: 'Support' },
	{ id: 'nora', email: 'nora@example.com', group: 'Finance' },
	{ id: 'liam', email: 'liam@example.com', group: 'Ops' }
];

export const inboxThreads = [
	{
		id: 'deploy',
		sender: 'Infra Team',
		subject: 'Production deploy window confirmed',
		status: 'Ready',
		updatedAt: '2m ago'
	},
	{
		id: 'billing',
		sender: 'Finance',
		subject: 'Invoice discrepancy on enterprise renewal',
		status: 'Needs review',
		updatedAt: '18m ago'
	},
	{
		id: 'access',
		sender: 'Support',
		subject: 'Access request for new workspace maintainers',
		status: 'Queued',
		updatedAt: '41m ago'
	}
];

export const financeSnapshot = [
	{ id: 'mrr', label: 'Monthly recurring revenue', value: '$182,400', delta: '+6.8%' },
	{ id: 'churn', label: 'Logo churn', value: '1.2%', delta: '-0.4 pts' },
	{ id: 'nps', label: 'Expansion pipeline', value: '$48,900', delta: '+12.1%' }
];

export const deploymentRuns = [
	{
		id: 'dep-481',
		service: 'Checkout API',
		owner: 'Infra',
		region: 'us-east-1',
		status: 'Healthy',
		updatedAt: '09:12'
	},
	{
		id: 'dep-482',
		service: 'Identity Worker',
		owner: 'Platform',
		region: 'sa-east-1',
		status: 'Rolling',
		updatedAt: '09:18'
	},
	{
		id: 'dep-483',
		service: 'Billing Queue',
		owner: 'Finance',
		region: 'us-west-2',
		status: 'Healthy',
		updatedAt: '09:24'
	},
	{
		id: 'dep-484',
		service: 'Session Cache',
		owner: 'Platform',
		region: 'eu-west-1',
		status: 'Degraded',
		updatedAt: '09:31'
	},
	{
		id: 'dep-485',
		service: 'Tenant Exporter',
		owner: 'Support',
		region: 'us-east-1',
		status: 'Healthy',
		updatedAt: '09:35'
	},
	{
		id: 'dep-486',
		service: 'Audit Trail',
		owner: 'Security',
		region: 'eu-central-1',
		status: 'Rolling',
		updatedAt: '09:42'
	},
	{
		id: 'dep-487',
		service: 'Usage Aggregator',
		owner: 'Analytics',
		region: 'us-west-2',
		status: 'Healthy',
		updatedAt: '09:49'
	},
	{
		id: 'dep-488',
		service: 'Support Inbox',
		owner: 'Support',
		region: 'sa-east-1',
		status: 'Healthy',
		updatedAt: '09:56'
	},
	{
		id: 'dep-489',
		service: 'Webhook Relay',
		owner: 'Integrations',
		region: 'us-east-1',
		status: 'Queued',
		updatedAt: '10:03'
	},
	{
		id: 'dep-490',
		service: 'Tenant Provisioner',
		owner: 'Ops',
		region: 'eu-west-1',
		status: 'Healthy',
		updatedAt: '10:11'
	}
];

export const workspaceMembers = [
	{
		id: 'member-danilo',
		name: 'Danilo Fernandez',
		email: 'danilo.fernandez+workspace-owner@example.com',
		region: 'Buenos Aires',
		plan: 'Enterprise',
		lastSeen: '2m ago'
	},
	{
		id: 'member-zahra',
		name: 'Zahra Khan',
		email: 'zahra@example.com',
		region: 'Dubai',
		plan: 'Business',
		lastSeen: '9m ago'
	},
	{
		id: 'member-jasper',
		name: 'Jasper Cole',
		email: 'jasper.with-a-very-long-email-address@example.com',
		region: 'Toronto',
		plan: 'Enterprise',
		lastSeen: '18m ago'
	},
	{
		id: 'member-marta',
		name: 'Marta Alvarez',
		email: 'marta@example.com',
		region: 'Madrid',
		plan: 'Business',
		lastSeen: '26m ago'
	},
	{
		id: 'member-nora',
		name: 'Nora Patel',
		email: 'nora@example.com',
		region: 'London',
		plan: 'Starter',
		lastSeen: '41m ago'
	},
	{
		id: 'member-liam',
		name: 'Liam Owens',
		email: 'liam@example.com',
		region: 'Dublin',
		plan: 'Enterprise',
		lastSeen: '1h ago'
	}
];

export const filterableRequests = [
	{
		id: 'req-201',
		requester: 'Northwind Labs',
		topic: 'SSO certificate rollover',
		team: 'Support',
		priority: 'Urgent',
		status: 'Open'
	},
	{
		id: 'req-202',
		requester: 'Comet Health',
		topic: 'Invoice mismatch on annual renewal',
		team: 'Finance',
		priority: 'Medium',
		status: 'Queued'
	},
	{
		id: 'req-203',
		requester: 'Atlas Works',
		topic: 'Webhook retry storm after maintenance',
		team: 'Infra',
		priority: 'High',
		status: 'Investigating'
	},
	{
		id: 'req-204',
		requester: 'Delta Freight',
		topic: 'Team invite emails delayed',
		team: 'Support',
		priority: 'Low',
		status: 'Open'
	},
	{
		id: 'req-205',
		requester: 'Hearth Cloud',
		topic: 'Missing usage export for March',
		team: 'Analytics',
		priority: 'Medium',
		status: 'Queued'
	},
	{
		id: 'req-206',
		requester: 'River Retail',
		topic: 'Card updater job paused in staging',
		team: 'Finance',
		priority: 'High',
		status: 'Resolved'
	}
];

export const invoiceRows = Array.from({ length: 18 }, (_, index) => ({
	id: `inv-${1000 + index}`,
	customer: ['Northwind', 'Comet', 'Atlas', 'Delta', 'Hearth', 'River'][index % 6],
	issuedAt: `2026-04-${String((index % 9) + 1).padStart(2, '0')}`,
	total: `$${(index + 4) * 320}`,
	status: ['Paid', 'Pending', 'Review'][index % 3]
}));

export const disabledUserIds = ['zahra', 'nora'];

export const tableSelectionCheckboxClass =
	'group inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm outline-none transition-all hover:border-blue-400 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white data-[indeterminate=true]:border-amber-500 data-[indeterminate=true]:bg-amber-500 data-[indeterminate=true]:text-white data-[disabled=true]:cursor-not-allowed data-[disabled=true]:border-gray-200 data-[disabled=true]:bg-gray-100 data-[disabled=true]:text-gray-300 data-[disabled=true]:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-blue-400 dark:data-[disabled=true]:border-gray-700 dark:data-[disabled=true]:bg-gray-800 dark:data-[disabled=true]:text-gray-600';

export const tableSelectionIndicatorClass = 'inline-flex h-3.5 w-3.5 items-center justify-center';
