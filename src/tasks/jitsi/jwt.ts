import jwt from 'jsonwebtoken';
import { buildJitsiUrl } from '../../utils/url';
import DefaultTask from '../default';
import { TaskParams } from '../task';

type SupportedAlgorithms = 'HS256' | 'HS384' | 'HS512'
| 'RS256' | 'RS384' | 'RS512'
| 'ES256' | 'ES384' | 'ES512'
| 'PS256' | 'PS384' | 'PS512'
| 'none';

/**
 * Generate a new JWT token and enter the meeting.
 *
 * @param {string} [secret] secret used to sign the token.
 * @param {string} [duration=1h] duration of the token before expiration.
 * @param {string} [audience] token audience.
 * @param {string} [issuer] token issuer.
 * @param {string} [subject] token subject.
 * @param {object} [context] context for Jitsi Meet JWT.
 * @param {string} [algorithm=HS256] algorithm used to sign the token.
 */
class JitsiJwtTask extends DefaultTask {
  async run(params?: TaskParams): Promise<void> {
    await super.run(params);

    const { instance } = this.args;
    const { room } = instance;

    const secret = this.getStringArg('secret');
    const expiresIn = this.getStringArg('duration', '1h');
    const aud = this.getStringArg('audience');
    const iss = this.getStringArg('issuer');
    const sub = this.getStringArg('subject');
    const context = this.args.params?.context || {};
    const algorithm = this.getStringArg('algorithm', 'HS256') as SupportedAlgorithms;

    if (![
      'HS256', 'HS384', 'HS512',
      'RS256', 'RS384', 'RS512',
      'ES256', 'ES384', 'ES512',
      'PS256', 'PS384', 'PS512',
      'none',
    ].includes(algorithm)) {
      throw new Error('Unsupported algorithm for JWT');
    }

    instance.jwt = jwt.sign({
      room, aud, iss, context, sub,
    }, secret, { expiresIn, algorithm });
    const url = buildJitsiUrl(instance);

    await this.args.driver.get(url);
  }
}

export default JitsiJwtTask;
