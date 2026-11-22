/** Caixa pronta para ser desenhada no visualizador. */
export interface ViewerBox {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  color: string;
}

/** Entrada da legenda: uma classe e a cor usada para ela. */
export interface CategoryLegendItem {
  id: number;
  name: string;
  color: string;
}