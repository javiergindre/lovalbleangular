export interface Workflow {
  workflowType: number;
  workflowId: number;
  workflowName: string;
}


export interface Activity {
  id: number;
  name: string;
}

export interface ActivityGroup {
  id: number;
  name: string;
  isFinal: boolean;
  toActivities: Activity[];
}

export interface WorkflowConfiguration {
  workflowId: number;
  workflowName: string;
  activityGroupDTOs: ActivityGroup[];
  rejectedTabName: string;
}



