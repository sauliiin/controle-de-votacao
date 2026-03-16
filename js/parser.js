/**
 * Extrator de dados administrativos
 * Identifica Relator, Protocolo e Interessado
 */
const Parser = {
    parseContent: (text) => {
        const results = [];
        // Split text by "Relator(a):"
        const relatorBlocks = text.split(/Relator\(a\):/i);
        
        // Skip the first block if it doesn't contain a relator
        for (let i = 1; i < relatorBlocks.length; i++) {
            const block = relatorBlocks[i];
            // Extract relator name from the first line
            const lines = block.trim().split(/\n/);
            const relatorName = lines[0].trim().toUpperCase();

            // Split this relator's block by the word "Protocolo" to separate individual processes
            const processBlocks = block.split(/Protocolo/i);
            const entries = [];

            // Skip the first sub-block (it's the relator name line)
            for (let j = 1; j < processBlocks.length; j++) {
                const pBlock = processBlocks[j];
                
                // Extract Full Protocol string and fallback
                const protFullMatch = pBlock.match(/Protocolo[^\n\r]*:\s*([^\n\r]+)/i);
                const fallbackProtMatch = pBlock.match(/(?:n[º°]|n\.|:)?\s*([\d.]{2,}[/\d-]+)/i);
                
                // Extract Solicitor
                const solMatch = pBlock.match(/Solicitante(?:\/\s*Interessado)?:\s*([^\n\r]+)/i);
                
                // Extract Assunto
                const assuntoMatch = pBlock.match(/Assunto:\s*([^\n\r]+)/i);

                // Extract Dispositivo da decisão
                // Need to match everything after "Dispositivo da decisão:" until the end of the block or next blank line.
                // Since blocks are split by "Protocolo", the rest of the text here belongs to this process.
                const dispMatch = pBlock.match(/Dispositivo da decisão:\s*([\s\S]*)/i);

                let fullProtocol = "";
                let baseProtocol = "";

                if (protFullMatch) {
                    fullProtocol = protFullMatch[1].trim();
                    const baseMatch = fullProtocol.match(/[\d.]{2,}[/\d-]+/);
                    baseProtocol = baseMatch ? baseMatch[0] : fullProtocol;
                } else if (fallbackProtMatch) {
                    fullProtocol = fallbackProtMatch[1].trim();
                    baseProtocol = fullProtocol;
                }

                if (baseProtocol) {
                    entries.push({
                        protocol: baseProtocol,
                        protocolFull: fullProtocol,
                        solicitor: solMatch ? solMatch[1].trim() : "Não identificado",
                        assunto: assuntoMatch ? assuntoMatch[1].trim() : "",
                        dispositivo: dispMatch ? dispMatch[1].trim() : ""
                    });
                }
            }

            results.push({
                relator: relatorName,
                data: entries
            });
        }
        return results;
    }
};
