export default function ConversationsPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-medium text-[#191735]">
        My Conversations
      </h1>

      <p className="mt-2 text-[#706a7e]">
        Your conversation history and open loops will appear here.
      </p>

      <div className="mt-8 rounded-[24px] border border-[#ddd5e8] bg-white p-12 text-center">
        <p className="text-lg text-[#9a91a3]">
          No conversations yet. Start a conversation to begin.
        </p>
      </div>
    </div>
  );
}
