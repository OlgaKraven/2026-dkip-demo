from pathlib import Path
from datetime import datetime
import json
import re
from subprocess import run
import sys
from tempfile import TemporaryDirectory

import openpyxl


def display_value(value, number_format):
    if isinstance(value, datetime):
        return value.strftime('%d.%m.%Y' if value.time() == datetime.min.time() else '%d.%m.%Y %H:%M')
    if type(value) in (int, float):
        if re.fullmatch(r'(?:#,##)?0(?:\.0+)?', number_format):
            decimals = len(number_format.partition('.')[2])
            grouping = ',' if number_format.startswith('#,##') else ''
            return format(value, f'{grouping}.{decimals}f').replace(',', '\u00a0').replace('.', ',')
        return str(value).replace('.', ',')
    return str(value)


def sheet_preview(sheet, cached_sheet):
    filled = {cell.coordinate: cell for row in sheet for cell in row if cell.value is not None}
    if not filled:
        return {'name': sheet.title, 'columns': [], 'rows': []}

    merges = {
        (area.min_row, area.min_col): area
        for area in sheet.merged_cells.ranges
        if sheet.cell(area.min_row, area.min_col).coordinate in filled
    }
    cells = filled.values()
    first_row = min(cell.row for cell in cells)
    first_col = min(cell.column for cell in cells)
    last_row = max([cell.row for cell in cells] + [area.max_row for area in merges.values()])
    last_col = max([cell.column for cell in cells] + [area.max_col for area in merges.values()])
    covered = {
        (row, col)
        for anchor, area in merges.items()
        for row, col in area.cells
        if (row, col) != anchor
    }
    widths = {
        col: dimension.width
        for dimension in sheet.column_dimensions.values()
        for col in range(dimension.min, dimension.max + 1)
    }
    default_width = sheet.sheet_format.defaultColWidth or 8.43
    columns = [widths.get(col, default_width) * 7.5 for col in range(first_col, last_col + 1)]

    rows = []
    for row in range(first_row, last_row + 1):
        cells = []
        for col in range(first_col, last_col + 1):
            if (row, col) in covered:
                continue
            cell = sheet.cell(row, col)
            if cell.value is None:
                cells.append(None)
                continue
            formula = cell.value if cell.data_type == 'f' else None
            cached = cached_sheet[cell.coordinate].value if formula else cell.value
            value = cached if cached is not None else cell.value
            item = {'cell': cell.coordinate, 'value': display_value(value, cell.number_format)}
            if formula:
                item['formula'] = formula
            area = merges.get((row, col))
            if area:
                item['colspan'] = area.size['columns']
                item['rowspan'] = area.size['rows']
            if cell.font.bold:
                item['bold'] = True
            if cell.font.sz and cell.font.sz >= 12:
                item['title'] = True
            if cell.alignment.horizontal == 'center':
                item['align'] = 'center'
            elif cell.alignment.horizontal == 'right' or type(value) in (int, float):
                item['align'] = 'right'
            # Give narrow Excel columns room for complete words at the preview font size.
            tokens = [item['value']] if item.get('align') == 'right' else re.split(r'[ \t\r\n]+', item['value'])
            min_width = max(map(len, tokens)) * 8.5 + 16
            start = col - first_col
            end = start + item.get('colspan', 1)
            extra = min_width - sum(columns[start:end])
            if extra > 0:
                for index in range(start, end):
                    columns[index] += extra / (end - start)
            cells.append(item)
        rows.append(cells)

    return {'name': sheet.title, 'columns': columns, 'rows': rows}


def workbook_preview(path):
    book = openpyxl.load_workbook(path, data_only=False)
    cached = openpyxl.load_workbook(path, data_only=True)
    try:
        return [sheet_preview(sheet, cached[sheet.title]) for sheet in book]
    finally:
        book.close()
        cached.close()


if __name__ == '__main__':
    print(json.dumps({Path(path).name: workbook_preview(Path(path)) for path in sys.argv[1:]},
                     ensure_ascii=False, separators=(',', ':')))
