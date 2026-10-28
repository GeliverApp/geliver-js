export function validateShipmentAddresses(body: Record<string, unknown>): void {
  for (const side of ['sender', 'recipient']) {
    const hasID = typeof body[`${side}AddressID`] === 'string' &&
      (body[`${side}AddressID`] as string).trim().length > 0;
    const hasAddress = body[`${side}Address`] != null;
    if ((side === 'recipient' && hasID === hasAddress) ||
        (side === 'sender' && hasID && hasAddress)) {
      throw new Error(`Provide exactly one of ${side}AddressID or ${side}Address`);
    }
  }
}
