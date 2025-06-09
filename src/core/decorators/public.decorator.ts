import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
/**
 * This is a custom decorator that marks a route as public.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
