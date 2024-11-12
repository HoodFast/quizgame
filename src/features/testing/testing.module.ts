import { Module } from '@nestjs/common';
import { TestingController } from './api/testing.controller';
import { TestingSqlQueryRepository } from './infrastructure/testing.query.repository';

@Module({
  imports: [],
  controllers: [TestingController],
  providers: [TestingSqlQueryRepository],
})
export class TestingModule {}
