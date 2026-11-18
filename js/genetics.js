/* Genetics engine — pure functions, no DOM.
   A genotype is a 2-letter string such as "Pp". Uppercase = dominant allele. */
GW.gen = (function () {
  const isDom = (a) => a !== a.toLowerCase();

  /** Combine two alleles into a genotype written dominant-first ("pP" -> "Pp"). */
  const join = (a, b) => (isDom(b) && !isDom(a) ? b + a : a + b);

  const pheno = (g) => (isDom(g[0]) || isDom(g[1]) ? 'dom' : 'rec');
  const alleles = (g) => [g[0], g[1]];
  const isHomo = (g) => g[0] === g[1];
  const uniq = (g) => Array.from(new Set(alleles(g)));

  /** The 4 gametes produced by meiosis of one cell (each allele copied twice). */
  const meiosis = (g) => [g[0], g[0], g[1], g[1]];

  /** Punnett square: rows = mother's gametes, columns = father's gametes. */
  function punnett(f, m) {
    return [0, 1].map((r) => [0, 1].map((c) => join(f[c], m[r])));
  }

  /** Counts over the 4 Punnett cells. */
  function counts(f, m) {
    const geno = {};
    const ph = { dom: 0, rec: 0 };
    punnett(f, m).flat().forEach((g) => {
      geno[g] = (geno[g] || 0) + 1;
      ph[pheno(g)]++;
    });
    return { geno, ph };
  }

  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  function reduce(nums) {
    const d = nums.filter((n) => n > 0).reduce(gcd);
    return nums.map((n) => n / d);
  }

  /** ["PP","Pp","pp"] for the letter of a genotype. */
  function genoOrder(letter) {
    const U = letter.toUpperCase();
    const L = letter.toLowerCase();
    return [U + U, U + L, L + L];
  }

  function genoRatioText(f, m) {
    const { geno } = counts(f, m);
    const present = genoOrder(f[0]).filter((g) => geno[g]);
    if (present.length === 1) return present[0] + ' ทั้งหมด';
    return present.join(' : ') + ' = ' + reduce(present.map((g) => geno[g])).join(' : ');
  }

  function phenoRatioText(f, m, T) {
    const { ph } = counts(f, m);
    if (!ph.rec) return T.dom.label + 'ทั้งหมด';
    if (!ph.dom) return T.rec.label + 'ทั้งหมด';
    const r = reduce([ph.dom, ph.rec]);
    return `${T.dom.short} : ${T.rec.short} = ${r[0]} : ${r[1]}`;
  }

  /** All distinct genotype-ratio answers among crosses of PP/Pp/pp (used as distractors). */
  function allGenoRatioTexts(letter) {
    const gs = genoOrder(letter);
    const out = new Set();
    gs.forEach((a) => gs.forEach((b) => out.add(genoRatioText(a, b))));
    return Array.from(out);
  }

  function allPhenoRatioTexts(T) {
    return [
      T.dom.label + 'ทั้งหมด',
      T.rec.label + 'ทั้งหมด',
      `${T.dom.short} : ${T.rec.short} = 3 : 1`,
      `${T.dom.short} : ${T.rec.short} = 1 : 1`,
      `${T.dom.short} : ${T.rec.short} = 1 : 3`,
    ];
  }

  /** Random offspring: one random allele from each parent. */
  function child(f, m) {
    const pick = (g) => g[Math.random() < 0.5 ? 0 : 1];
    return join(pick(f), pick(m));
  }

  /** Expected fraction (0..1) of each phenotype. */
  function expected(f, m) {
    const { ph, geno } = counts(f, m);
    return { dom: ph.dom / 4, rec: ph.rec / 4, geno };
  }

  return {
    isDom, join, pheno, alleles, isHomo, uniq, meiosis, punnett, counts, reduce,
    genoOrder, genoRatioText, phenoRatioText, allGenoRatioTexts, allPhenoRatioTexts,
    child, expected,
  };
})();
