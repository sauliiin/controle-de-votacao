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
        const exOfficioRegex = /Ex\s+offício/i;

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine) return;

            // Check for Relator
            const relMatch = trimmedLine.match(relatorRegex);
            if (relMatch) {
                currentRelator = relMatch[1].trim().toUpperCase();
                return;
            }

            // Check for Ex Offício (acts as a temporary relator/marker)
            if (exOfficioRegex.test(trimmedLine)) {
                // We keep the currentRelator if it exists, but might want to mark the next entry
                // For now, let's treat it as a trigger or just ignore if it's a label
                return;
            }

            // Check for Protocol (Starts a new entry)
            const protMatch = trimmedLine.match(protocolRegex);
            if (protMatch) {
                // If we found a protocol but don't have a relator, use a placeholder
                const relatorToUse = currentRelator || "NÃO IDENTIFICADO";
                
                let relatorGroup = results.find(r => r.relator === relatorToUse);
                if (!relatorGroup) {
                    relatorGroup = { relator: relatorToUse, data: [] };
                    results.push(relatorGroup);
                }

                currentEntry = {
                    protocol: protMatch[1].trim(),
                    protocolFull: trimmedLine, // Keep full line for display if possible
                    solicitor: "Não identificado",
                    assunto: "",
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
