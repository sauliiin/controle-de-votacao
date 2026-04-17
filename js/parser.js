/**
 * Extrator de dados administrativos
 * Identifica Relator, Protocolo e Interessado
 */
const Parser = {
    parseContent: (text) => {
        const results = [];
        const normalizeField = (value) => value
            .replace(/\s*\n+\s*/g, ' ')
            .replace(/[ \t]{2,}/g, ' ')
            .trim();
        const normalizeProtocol = (value) => {
            const cleanedValue = normalizeField(value)
                .replace(/[–—]/g, '-')
                .replace(/\s*:\s*/g, ':');
            const protocolMatch = cleanedValue.match(/([\d.]+\/\d{4}-\d{2})\s*-?\s*([A-Z]+(?:-[A-Z]+)*)/i);

            if (protocolMatch) {
                return `${protocolMatch[1]} - ${protocolMatch[2].toUpperCase()}`;
            }

            return cleanedValue
                .replace(/^[^0-9]+/, '')
                .replace(/\s*[:;.,-]+\s*$/, '')
                .trim();
        };

        // Extract Relator blocks
        const relatorBlocks = text.split(/Relator(?:a|\(a\))?:?\s*/i);

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
            const processBlocks = content.split(/Protocolo\b/i);
            const entries = [];

            processBlocks.forEach(pBlock => {
                const hasPartyField = /(Solicitante(?:\s*\/\s*Interessado)?|Interessado)\s*:/i.test(pBlock);
                if (!hasPartyField) return;

                // Extract protocol info until the next labeled field.
                const protocolMatch =
                    pBlock.match(/(?:n[º°\.]?|:)\s*([\s\S]+?)(?=\s*(?:Solicitante(?:\s*\/\s*Interessado)?|Interessado|Assunto)\s*:)/i) ||
                    pBlock.match(/^\s*([\s\S]+?)(?=\s*(?:Solicitante(?:\s*\/\s*Interessado)?|Interessado|Assunto)\s*:)/i);
                
                // Extract solicitor/interested field, even when the value spans multiple lines.
                const solicitorMatch = pBlock.match(/(?:Solicitante(?:\s*\/\s*Interessado)?|Interessado)\s*:\s*([\s\S]+?)(?=\s*Assunto\s*:)/i);
                
                // Extract Assunto (Everything after "Assunto" until the end or next marker)
                const assuntoMatch = pBlock.match(/Assunto\s*:\s*([\s\S]+?)(?=\s*(?:Protocolo\b|Relator(?:a|\(a\))?:?\s|Conforme|$))/i);

                if (protocolMatch) {
                    const fullProtocol = normalizeProtocol(protocolMatch[1]);
                    // Clean number only for the relator view
                    const baseMatch = fullProtocol.match(/[\d.]+\/\d{4}-\d{2}/);
                    const baseProtocol = baseMatch ? baseMatch[0] : fullProtocol;

                    entries.push({
                        protocol: baseProtocol,
                        protocolFull: fullProtocol,
                        solicitor: solicitorMatch ? normalizeField(solicitorMatch[1]) : "Não identificado",
                        assunto: assuntoMatch ? normalizeField(assuntoMatch[1]) : "Sem assunto definido",
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
