'use babel';
import Path from '../commons/path';
import File from '../commons/file';

import {window, Range, Selection, Position} from 'vscode';

/**
 * Classe para manipulação do editor do VSCode
 */
export default class Editor {

  /**
   * Return file path
   */
  getPath() {
    return new Path(this.getActiveEditor().document.fileName).toString();
  }

   /**
   * Return the document text
   */
  getEditorBuffer() {
    return this.getActiveEditor().document.getText();
  }

  /**
   * Return the text selected
   */
  getSelectionBuffer() {
    let editor = this.getActiveEditor();
    let buffer: string[] = new Array();
    editor.selections.forEach(element => { 
      buffer.push(this.getRangeBuffer(new Range(element.start, element.end)));
    });
    return buffer;
  }

  /**
   * Return range of selection
   */
  getSelectionRange() {
    let editor = this.getActiveEditor();
    let range: Range[] = new Array();
    editor.selections.forEach(element => {
      range.push(new Range(element.start, element.end));
    });
    return range;
  }

   /**
   * Define a editor selection
   */
  setSelectionRange(range: Range) {
    this.getActiveEditor().selection = new Selection(range.start, range.end);
  }

   /**
   * Define multiple editor selections
   */
  setSelectionRanges(range: Range[]) {
    let editor = this.getActiveEditor();
    let selections: Selection[] = [];
    range.forEach(element => {
      selections.push(new Selection(element.start, element.end));
    });
    editor.selections = selections;
  }

   /**
   * Return the text of a range
   */
  getRangeBuffer(range: Range) {
    return this.getActiveEditor().document.getText(range);
  }

  /**
   * Change text of selection
   */
  replaceSelection(buffer: string) {
    let editor = this.getActiveEditor();
    editor.edit(editBuilder => {
      editor.selections.forEach(element => {
        editBuilder.replace(element, buffer);
      });
    });
  }
  
  /**
   * Faz com que a seleção atual contemple linhas inteiras
   */
  selectWholeLines() {
    let editor = this.getActiveEditor();
    let range = new Range (new Position(editor.selection.start.line, 0), new Position(editor.selection.end.line + 1, 0));
    this.setSelectionRange(range);
  }

  /**
   * Retorna a palavra corrente
   */
  getCurrentWord() {
    let editor = this.getActiveEditor();
    let pattern = /([\w\-]|\(@\)|\(#\))+/g;
    let range = editor.document.getWordRangeAtPosition(editor.selection.start, pattern);
    if(range === undefined){
      return '';
    }
    return this.getRangeBuffer(range);
  }

  /**
   * Select the current word
   */
  selectCurrentWord() {
    let editor = this.getActiveEditor();
    let pattern = /([\w\-]|\(@\)|\(#\))+/g;
    let range = editor.document.getWordRangeAtPosition(editor.selection.start, pattern);
    if(range === undefined){
      return;
    }
    this.setSelectionRange(range);
  }

  /**
   * Retorna a linha corrente
   */
  getCurrentRow() {
    return this.getActiveEditor().selection.start.line;
  }

  /**
   * Define o conteúdo da linha corrente
   */
  setCurrentLine(text: String) {
    let editor = this.getActiveEditor();
    editor.edit(editBuilder => {
      editBuilder.replace(new Range(new Position(editor.selection.start.line, 0), new Position(editor.selection.end.line + 1, 0)), text + "\n");
    });    
  }
  
   /**
   * Retorna o tamanho da linha corrente
   */
  getCurrentLineSize() {
    return this.getCurrentLine().replace(/ +$/, '').length;
  }

  /**
   * Retorna o conteúdo de uma linha no editor
   */
  getCurrentLine() {
    return this.getLine(this.getActiveEditor().selection.start.line);
  }

  /**
   * Retorna o conteúdo de uma linha no editor
   */
  getLine(lineIndex: number) {
    let editor = this.getActiveEditor();
    return editor.document.lineAt(lineIndex).text;
  }

  /**
   * Define a posição do cursor
   */
  setCursor(cursor: Position) {
    return this.setSelectionRange(new Range(cursor, cursor));
  }

  /**
   * Retorna a posição do cursor
   */
  getCursor() {
    return new Position(this.getActiveEditor().selection.start.line, this.getActiveEditor().selection.start.character);
  }  

  /**
   * Posiciona o cursor na coluna. Funciona com múltiplos cursores
   */
  gotoColumn(column: number) {
    let editor = this.getActiveEditor();
    let range: Range[] = [];
    editor.selections.forEach(element => {
      let size = this.getLine(element.start.line).length;
      let diff = column - size;
      if (diff > 0) {
        this.setTextPosition(new Position(element.end.line, size), " ".repeat(diff));
      }
      range.push(new Range(new Position(element.start.line, column), new Position(element.start.line, column)));
    });
    this.setSelectionRanges(range);
  }

  /**
   * Define o conteúdo da linha corrente
   */
  setTextPosition(Position: Position, text: string) {
    let editor = this.getActiveEditor();
    editor.edit(editBuilder => {
      editBuilder.insert(Position, text);
    });    
  }

   /**
   * Return if this file is a bat file
   */
  isBat() {
    return this.getPath().toLowerCase().endsWith(".bat");
  }
  
  /**
   * Return if this file is a ruby file
   */
  isRuby() {
    return this.getPath().toLowerCase().endsWith(".rb");
  } 
  
  /**
   * Digita o texto no editor
   */
  type(text: string) {
    this.insertText(text);
  }

  /**
   * Insere um texto no editor
   */
  insertText(text: string) {
    let editor = this.getActiveEditor();
    editor.edit(editBuilder => {
      editor.selections.forEach(element => {
        editBuilder.insert(element.start, text);
      });
    });
  }  
  
  /**
   * Move o cursor para a linha posterior
   */
  moveDown() {
    this.move(1);
  } 
  
  /**
   * Move o cursor para a linha anterior
   */
  moveUp() {
    this.move(-1);
  }

  move(num: number){
    let editor = this.getActiveEditor();
    let newselection: Selection[] = [];
    editor.selections.forEach(element => {
      newselection.push(new Selection(new Position(element.start.line + num, element.start.character),new Position(element.end.line + num, element.end.character)));
    });
    editor.selections = newselection;
  }

   /**
   * Return active editor
   */
  getActiveEditor() {
    return window.activeTextEditor;
  }

}
