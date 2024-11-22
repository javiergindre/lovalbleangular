export interface DrugDto {
  id: number;
  treamentRequestId: number;
  comments?: string;
  quantity?: string;
  frequency?: string;
  drug: DrugsListView;
  edit?: boolean;
  doctorLookupItem: {
    Id: number,
    Text: string,
  };
}

export interface DrugsListView {
  id: number;
  drugID: number;
  commercialDrugId?: number;
  code: string;
  text: string;
  price: number;
  tableDrugName: string;
}
