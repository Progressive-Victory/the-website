import z from 'zod';

export enum ShippingStatus {
	NOT_SHIPPED = 'not_shipped',
	SHIPPED = 'shipped',
}

export const zShippingStatus = z.enum(ShippingStatus);
