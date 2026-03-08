import { Vote, CheckCircle, XCircle, Minus, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { VotePosition } from "@/lib/types";

interface VoteHistoryProps {
  votes: (VotePosition & { vote: any })[];
}

export function VoteHistory({ votes }: VoteHistoryProps) {
  const getVoteIcon = (position: string) => {
    switch (position) {
      case "yes":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "no":
        return <XCircle className="h-4 w-4 text-red-400" />;
      case "abstain":
        return <Minus className="h-4 w-4 text-yellow-400" />;
      case "absent":
        return <Clock className="h-4 w-4 text-gray-400" />;
      default:
        return <Vote className="h-4 w-4 text-gray-400" />;
    }
  };

  const getVoteColor = (position: string) => {
    switch (position) {
      case "yes":
        return "text-green-400 bg-green-500/10 border-green-500/20";
      case "no":
        return "text-red-400 bg-red-500/10 border-red-500/20";
      case "abstain":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "absent":
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const sortedVotes = votes.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="glass-card-dash p-6 rounded-2xl border border-black/5">
      <div className="flex items-center gap-3 mb-6">
        <Vote className="h-6 w-6 text-blue-400" />
        <h3 className="text-xl font-bold text-pure-black">Historial de Votos</h3>
      </div>

      <div className="space-y-3">
        {sortedVotes.map((voteItem) => (
          <div
            key={voteItem.id}
            className="p-4 rounded-xl border border-black/5 bg-white/40"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-pure-black text-sm font-medium leading-tight mb-1">
                  {voteItem.vote.title}
                </h4>
                <p className="text-xs text-gray-400">
                  {formatDate(voteItem.vote.voted_at)}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getVoteColor(voteItem.position)}`}>
                {getVoteIcon(voteItem.position)}
                <span className="capitalize">{voteItem.position}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Resultado: {voteItem.vote.result}</span>
              <span>
                {voteItem.vote.yes_count} Sí • {voteItem.vote.no_count} No • {voteItem.vote.abstain_count} Abs
              </span>
            </div>
          </div>
        ))}
      </div>

      {votes.length === 0 && (
        <div className="text-center py-8">
          <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No hay votos registrados</p>
        </div>
      )}

      {votes.length > 0 && (
        <div className="mt-6 pt-4 border-t border-black/5">
          <div className="text-xs text-gray-400 text-center">
            Mostrando los últimos {Math.min(votes.length, 10)} votos
          </div>
        </div>
      )}
    </div>
  );
}