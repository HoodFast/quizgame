import { Module } from '@nestjs/common';
import { TestingController } from '../../testing/api/testing.controller';
import { TestingSqlQueryRepository } from '../../testing/infrastructure/testing.query.repository';

@Module({
  imports: [],
  controllers: [TestingController],
  providers: [TestingSqlQueryRepository],
})
export class TestingModule {}
