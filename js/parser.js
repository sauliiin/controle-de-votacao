/**
 * Extrator de dados administrativos
 * Identifica Relator, Protocolo e Interessado
 */
const Parser = {
    parseContent: (text) => {
        const results = [];
        // Extract Relator blocks
        const relatorBlocks = text.split(/Relator\(a\):/i);

        relatorBlocks.forEach((block, index) => {
            if (index === 0 && !block.toLowerCase().includes('protocolo')) return;

            let relatorName = "NÃO IDENTIFICADO";
            let content = block;

            if (index > 0) {
                const lines = block.trim().split(/\n/);
                relatorName = lines[0].trim().toUpperCase();
                content = lines.slice(1).join('\n');
            }

            // Split by "Protocolo" to get individual process entries
            const processBlocks = content.split(/Protocolo/i);
            const entries = [];

            processBlocks.forEach(pBlock => {
                if (!pBlock.toLowerCase().includes('solicitante')) return;

                // Extract Protocol (Everything after "n°", "nº", "n." or ":" until "Solicitante")
                const protocolMatch = pBlock.match(/(?:n[º°\.]|:)+\s*([^\n\r]+?)(?=\s*Solicitante)/i);
                
                // Extract Solicitor (Everything between "Solicitante" and "Assunto")
                const solicitorMatch = pBlock.match(/(?:Solicitante|Interessado|Solicitante\/Interessado):\s*([^\n\r]+?)(?=\s*Assunto)/i);
                
                // Extract Assunto (Everything after "Assunto" until the end or next marker)
                const assuntoMatch = pBlock.match(/Assunto:\s*([\s\S]+?)(?=\s*(?:Protocolo|Relator\(a\)|Conforme|$))/i);

                if (protocolMatch) {
                    const fullProtocol = protocolMatch[1].trim();
                    // Clean number only for the relator view
                    const baseMatch = fullProtocol.match(/[\d.]{2,}[/\d-]+/);
                    const baseProtocol = baseMatch ? baseMatch[0] : fullProtocol;

                    entries.push({
                        protocol: baseProtocol,
                        protocolFull: fullProtocol,
                        solicitor: solicitorMatch ? solicitorMatch[1].trim() : "Não identificado",
                        assunto: assuntoMatch ? assuntoMatch[1].trim() : "Sem assunto definido",
                        dispositivo: "",
                        votes: {},
                        obs: {},
                        discutir: {}
                    });
                }
            });

            if (entries.length > 0) {
                let relGroup = results.find(r => r.relator === relatorName);
                if (relGroup) {
                    relGroup.data.push(...entries);
                } else {
                    results.push({ relator: relatorName, data: entries });
                }
            }
        });

        return results;
    }
};
