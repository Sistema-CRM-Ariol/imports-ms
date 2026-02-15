

export class CreateImportItemDto {

    productId: string;

    productName: string;

    quantityOrdered: number;

    quantityReceived?: number | null | undefined;

    priceUnit: number;

    currency?: string;
}
