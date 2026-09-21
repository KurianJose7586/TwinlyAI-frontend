import { useQuery } from "@tanstack/react-query";
import { RelayService } from "@/services/relay.service";

/** Candidate inbox. Poll only while the inbox is open, so questions show up live there. */
export const useRelayInbox = (poll = false) =>
    useQuery({
        queryKey: ["relay-inbox"],
        queryFn: RelayService.inbox,
        refetchInterval: poll ? 5000 : false,
    });
