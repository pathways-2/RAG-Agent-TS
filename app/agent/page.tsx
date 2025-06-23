import AgentChat from "@/components/agent-chat";

export default function Agent() {
  return (
    <div>
      <div className="text-center p-4">
        <h1 className="text-3xl font-bold text-blue-600 mb-2">GoAware</h1>
        <p className="text-gray-600 text-sm">
          Enter a country to check travel advisories and get real-time travel information.
        </p>
      </div>
      <AgentChat />
    </div>
  );
}
