import * as core from "@actions/core";
import { HttpClient } from "@actions/http-client";

const parseList = (str: string) =>
  str
    .split(/\s|,/)
    .map((elem) => elem.trim())
    .filter((elem) => elem.length > 0);
const getRandomElement = (arr: string[]) =>
  arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

/**
 * Action bootstrapper.
 *
 * @export
 */
export async function run(): Promise<void> {
  const maxRetries = parseInt(core.getInput("maxRetries"), 10);
  const ipv4Servers: string[] = parseList(core.getInput("ipv4Servers"));
  const ipv6Servers: string[] = parseList(core.getInput("ipv6Servers"));

  const http = new HttpClient("haythem/public-ip", undefined, {
    allowRetries: true,
    maxRetries: maxRetries,
  });

  let numTries = 0;
  let success = false;
  while (!success && numTries < maxRetries) {
    console.log(success);
    try {
      const ipv4Server = getRandomElement(ipv4Servers);
      const ipv6Server = getRandomElement(ipv6Servers);
      const ipv4 = await http.getJson<IPResponse>(ipv4Server);
      const ipv6 = await http.getJson<IPResponse>(ipv6Server);

      core.setOutput("ipv4", ipv4.result.ip);
      core.setOutput("ipv6", ipv6.result.ip);

      core.info(`ipv4: ${ipv4.result.ip} server: ${ipv4Server}`);
      core.info(`ipv6: ${ipv6.result.ip} server: ${ipv6Server}`);
      success = true;
      core.info("success");
    } catch (error) {
      if (numTries == maxRetries - 1) {
        core.setFailed(error?.message);
      }
    }
    numTries++;
  }
}

/**
 * IPify Response.
 *
 * @see https://www.ipify.org/
 */
interface IPResponse {
  ip: string;
}

run();
