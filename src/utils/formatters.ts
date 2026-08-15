export interface ParsedItem {
  name: string;
  qty: number;
  unitPrice: number;
  total: number;
  raw: string;
}

export interface ParsedKeterangan {
  title: string;
  hasRincian: boolean;
  items: ParsedItem[];
  rawRincian: string;
}

export function parseKeterangan(keterangan: string): ParsedKeterangan {
  if (!keterangan) {
    return { title: '-', hasRincian: false, items: [], rawRincian: '' };
  }

  const clean = keterangan.trim();
  const match = clean.match(/^(.*?)\s*\[Rincian:\s*(.*)\]\s*$/s) || 
                clean.match(/^(.*?)\s*\(Rincian:\s*(.*)\)\s*$/s);

  if (!match) {
    return {
      title: clean,
      hasRincian: false,
      items: [],
      rawRincian: ''
    };
  }

  const title = match[1].trim() || 'Pengeluaran Kegiatan';
  const rawRincian = match[2].trim();

  // Split item strings by closing parenthesis delimiter or commas
  const itemStrings: string[] = [];
  const rawParts = rawRincian.split(/\),\s*/);

  rawParts.forEach((part, idx) => {
    let piece = part.trim();
    if (idx < rawParts.length - 1 && !piece.endsWith(')')) {
      piece += ')';
    }
    if (piece) {
      itemStrings.push(piece);
    }
  });

  const items: ParsedItem[] = itemStrings.map(str => {
    // Pattern 1: "ITEM NAME (123 item @Rp 5.000 = Rp 615.000)" or "ITEM NAME (123 item @Rp 5.000)"
    const matchWithQty = str.match(/^(.*?)\s*\(([0-9]+)\s*item\s*@Rp\s*([0-9.,]+)(?:\s*=\s*Rp\s*([0-9.,]+))?\)$/i);
    if (matchWithQty) {
      const name = matchWithQty[1].trim();
      const qty = parseInt(matchWithQty[2], 10) || 1;
      const unitPrice = parseInt(matchWithQty[3].replace(/[.,]/g, ''), 10) || 0;
      const total = matchWithQty[4] 
        ? parseInt(matchWithQty[4].replace(/[.,]/g, ''), 10) 
        : (qty * unitPrice);
      return { name, qty, unitPrice, total, raw: str };
    }

    // Pattern 2: "ITEM NAME (Rp 110.000)"
    const matchSimple = str.match(/^(.*?)\s*\(Rp\s*([0-9.,]+)\)$/i);
    if (matchSimple) {
      const name = matchSimple[1].trim();
      const total = parseInt(matchSimple[2].replace(/[.,]/g, ''), 10) || 0;
      return { name, qty: 1, unitPrice: total, total, raw: str };
    }

    // Pattern 3: "ITEM NAME - Rp 50.000" or raw item
    return { name: str.replace(/^\s*[•\-*]\s*/, ''), qty: 1, unitPrice: 0, total: 0, raw: str };
  });

  return {
    title,
    hasRincian: items.length > 0,
    items,
    rawRincian
  };
}

export function formatRupiah(num: number): string {
  return 'Rp ' + (num || 0).toLocaleString('id-ID');
}
