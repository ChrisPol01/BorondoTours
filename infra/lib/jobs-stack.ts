// Jobs: EventBridge Schedulers + SQS queues + Step Functions
// Triggers:
//   EventBridge cron → Lambda 8-jobs handlers
//   SQS queues (+ DLQ) → Lambda 6-notifications
//   Step Functions → flujos multi-paso (Split Fare, conciliación)

// TODO: implementar con CDK

export {};
