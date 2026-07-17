import { describe, test, expect } from "vitest";
import { parsePreco, calcularProduto } from "./pricing.js";

// ─── Parse de preço ─────────────────────────────────────────────

describe("parsePreco", () => {
  test("número limpo permanece igual", () => {
    expect(parsePreco(129.9)).toBeCloseTo(129.9);
  });

  test("string pt-BR com milhar e decimal → número correto", () => {
    expect(parsePreco("1.299,90")).toBeCloseTo(1299.9);
  });

  test("string pt-BR sem milhar → número correto", () => {
    expect(parsePreco("249,90")).toBeCloseTo(249.9);
  });

  test("zero permanece zero", () => {
    expect(parsePreco(0)).toBe(0);
  });
});

// ─── Cálculo por produto ────────────────────────────────────────

describe("calcularProduto", () => {
  test("produto padrão — Fone Bluetooth", () => {
    const r = calcularProduto({ preco: 129.9, custo: 68, demanda: 950 });
    expect(r.receita).toBeCloseTo(123405);
    expect(r.lucro).toBeCloseTo(58805);
    expect(r.margem).toBeCloseTo(47.65, 1);
  });

  test("preço em string pt-BR — Teclado Mecânico", () => {
    const r = calcularProduto({ preco: "1.299,90", custo: 720, demanda: 180 });
    expect(r.receita).toBeCloseTo(233982);
    expect(r.lucro).toBeCloseTo(104382);
    expect(r.margem).toBeCloseTo(44.61, 1);
  });

  test("custo null — lucro e margem nunca devem ser inflados como se custo fosse zero", () => {
    const r = calcularProduto({ preco: 149, custo: null, demanda: 430 });
    expect(r.receita).toBeCloseTo(64070);
    expect(r.lucro === null || Number.isNaN(r.lucro)).toBe(true);
    expect(r.margem === null || Number.isNaN(r.margem)).toBe(true);
  });

  test("preço zero — Brinde Adesivos — margem não pode ser Infinity", () => {
    const r = calcularProduto({ preco: 0, custo: 2.5, demanda: 3000 });
    expect(r.receita).toBe(0);
    expect(r.lucro).toBeCloseTo(-7500);
    expect(r.margem === null || r.margem === 0 || Number.isNaN(r.margem)).toBe(true);
    expect(Number.isFinite(r.margem) || r.margem === null).toBe(true);
  });

  test("custo maior que preço — Power Bank — margem negativa legítima", () => {
    const r = calcularProduto({ preco: 179.9, custo: 205, demanda: 260 });
    expect(r.receita).toBeCloseTo(46774);
    expect(r.lucro).toBeCloseTo(-6526);
    expect(r.margem).toBeLessThan(0);
    expect(r.margem).toBeCloseTo(-13.95, 1);
  });
});
