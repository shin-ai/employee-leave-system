export type Team = {
  id: string;
  name: string;
  picEmployeeIds: string[]; // PIC = Person In Charge (leave approvers), multiple allowed
};
