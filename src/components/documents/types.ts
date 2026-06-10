export interface DocumentFields {
  // Талуудын мэдээлэл
  companyName: string;
  registerNumber: string;
  stateRegisterNumber: string;
  companyAddress: string;
  phone: string;
  email: string;
  bankName: string;
  bankAccount: string;
  contactPerson: string;
  contactPosition: string;

  // Бүтээгдэхүүн / үйлчилгээ
  productDescription: string;

  // Талбайн мэдээлэл
  boothIds: string;
  boothArea: string;
  pricePerM2: string;
  additionalFee: string;
  totalPriceUsd: string;
  totalPriceMnt: string;

  // Нэмэлт үйлчилгээ
  needsStandWall: boolean;
  needsSignage: boolean;
  signageName: string;
  needsStageProgram: boolean;
  needsVipRoom: boolean;

  // Баримт бичгийн дугаарлалт
  contractNo: string;
  contractDate: string;
  invoiceNo: string;
  invoiceDate: string;
}

export const buildDefaultFields = (req: any): DocumentFields => {
  const boothIds: string[] = Array.isArray(req?.booth_ids) ? req.booth_ids : [];
  return {
    companyName: req?.company_name || '',
    registerNumber: req?.register_number || '',
    stateRegisterNumber: req?.state_register_number || '',
    companyAddress: req?.company_address || '',
    phone: req?.phone || '',
    email: req?.email || '',
    bankName: req?.bank_name || '',
    bankAccount: req?.bank_account || '',
    contactPerson: req?.contact_person || '',
    contactPosition: req?.contact_position || '',
    productDescription: req?.product_description || '',
    boothIds: boothIds.join(', '),
    boothArea: '',
    pricePerM2: '',
    additionalFee: '',
    totalPriceUsd: req?.total_price_usd ? String(req.total_price_usd) : '',
    totalPriceMnt: '',
    needsStandWall: !!req?.needs_stand_wall,
    needsSignage: !!req?.needs_signage,
    signageName: req?.signage_name || '',
    needsStageProgram: !!req?.needs_stage_program,
    needsVipRoom: !!req?.needs_vip_room,
    contractNo: req?.contract_no || '',
    contractDate: new Date().toISOString().slice(0, 10),
    invoiceNo: req?.invoice_no || '',
    invoiceDate: new Date().toISOString().slice(0, 10),
  };
};
