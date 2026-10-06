import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

const MAP: Record<string, [number, string]> = {
  '23503': [409, 'This record is linked to other records, so the operation was blocked. Deactivate it instead of deleting.'],
  '23505': [409, 'A record with the same unique value already exists.'],
  '23502': [400, 'A required field is missing or empty.'],
  '22P02': [400, 'A value has an invalid format.'],
};

/** Turns Postgres constraint errors into clean 4xx responses instead of 500s. */
@Catch(QueryFailedError)
export class DbExceptionFilter implements ExceptionFilter {
  private log = new Logger('DB');
  catch(e: QueryFailedError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const code: string = (e as any).driverError?.code ?? (e as any).code;
    const hit = MAP[code];
    if (!hit) { this.log.error(e.message); return res.status(500).json({ statusCode: 500, message: 'Internal server error' }); }
    res.status(hit[0]).json({ statusCode: hit[0], error: hit[0] === 409 ? 'Conflict' : 'Bad Request', message: hit[1] });
  }
}
