import { Contracts, Utils as AppUtils } from "@arkecosystem/core-kernel";
import { Utils } from "@arkecosystem/crypto";

import { getProperty } from "./get-property";

// todo: review the implementation
export const sortEntries = <T>(
    params: Contracts.Database.QueryParameters,
    entries: Contracts.State.Wallet[],
    defaultValue,
) => {
    const [iteratee, order] = params.orderBy ? params.orderBy : defaultValue;

    if (["balance", "voteBalance"].includes(iteratee)) {
        return Object.values(entries).sort((a: Contracts.State.Wallet, b: Contracts.State.Wallet) => {
            const iterateeA: Utils.BigNumber = getProperty(a, iteratee) || Utils.BigNumber.ZERO;
            const iterateeB: Utils.BigNumber = getProperty(b, iteratee) || Utils.BigNumber.ZERO;

            return order === "asc" ? iterateeA.comparedTo(iterateeB) : iterateeB.comparedTo(iterateeA);
        });
    }

    return AppUtils.orderBy(
        entries,
        (entry: T) => {
            if (typeof iteratee === "function") {
                // @ts-ignore
                return iteratee(entry);
            }

            if (AppUtils.has(entry, iteratee)) {
                return AppUtils.get(entry, iteratee);
            }

            const delegateAttribute: string = `attributes.delegate.${iteratee}`;
            if (AppUtils.has(entry, delegateAttribute)) {
                return AppUtils.get(entry, delegateAttribute);
            }

            return AppUtils.get(entry, `attributes.${iteratee}`);
        },
        [order],
    );
};
