/**
 * Extrator de dados administrativos
 * Identifica Relator, Protocolo e Interessado
 */
const Parser = {
    parseContent: (text) => {
        const lines = text.split(/\r?\n/);
        const results = [];
        let currentRelator = null;
        let currentEntry = null;

        const relatorRegex = /Relator\(a\):\s*([^\n\r]+)/i;
        const protocolRegex = /(?:Protocolo[^\n\r]*[:\s]|n[º°]|n\.)\s*([\d.]{2,}[/\d-]+)/i;
        const solicitorRegex = /(?:Solicitante|Interessado|Solicitante\/Interessado):\s*([^\n\r]+)/i;
        const assuntoRegex = /Assunto:\s*([^\n\r]+)/i;

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            // Check for Relator
            const relMatch = trimmedLine.match(relatorRegex);
            if (relMatch) {
                currentRelator = relMatch[1].trim().toUpperCase();
                return;
            }

            // Check for Protocol (Starts a new entry)
            // Fix: We reset currentEntry only when a NEW protocol line is found
            const protMatch = trimmedLine.match(protocolRegex);
            if (protMatch) {
                const relatorToUse = currentRelator || "NÃO IDENTIFICADO";
                
                let relatorGroup = results.find(r => r.relator === relatorToUse);
                if (!relatorGroup) {
                    relatorGroup = { relator: relatorToUse, data: [] };
                    results.push(relatorGroup);
                }

                currentEntry = {
                    protocol: protMatch[1].trim(),
                    protocolFull: trimmedLine,
                    solicitor: "Não identificado",
                    assunto: "Sem assunto definido", // Default placeholder
                    dispositivo: "",
                    votes: {},
                    obs: {},
                    discutir: {}
                };
                relatorGroup.data.push(currentEntry);
                return;
            }

            // Check for Solicitor
            const solMatch = trimmedLine.match(solicitorRegex);
            if (solMatch && currentEntry) {
                currentEntry.solicitor = solMatch[1].trim();
                return;
            }

            // Check for Assunto
            const assMatch = trimmedLine.match(assuntoRegex);
            if (assMatch && currentEntry) {
                currentEntry.assunto = assMatch[1].trim();
                return;
            }
        });

        return results;
    }
};
