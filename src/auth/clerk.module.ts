import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { ClerkStrategy } from './clerk.strategy';
import { clerkClientProvider } from './clerk.provider';
@Module({
    imports: [PassportModule],
    providers: [
        ClerkStrategy,
        clerkClientProvider
    ],
    exports: [PassportModule , clerkClientProvider],
})
export class ClerkModule { }
