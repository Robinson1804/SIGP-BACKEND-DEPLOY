import { DataSource } from 'typeorm';

/**
 * Interface for database seeders
 */
export interface Seeder {
  /**
   * Name of the seeder for logging purposes
   */
  name: string;

  /**
   * Order of execution (lower = earlier)
   */
  order: number;

  /**
   * Run the seeder
   */
  run(dataSource: DataSource): Promise<void>;

  /**
   * Revert/clean the seeder data (optional)
   */
  revert?(dataSource: DataSource): Promise<void>;
}
