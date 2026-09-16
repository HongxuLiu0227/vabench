"""WIS spec package: reliable .twb → Workbook Interface Specification."""

from .wis_parser import SCHEMA_VERSION, build_wis, decode_field_ref, parse_shelf_expression

__all__ = ["build_wis", "decode_field_ref", "parse_shelf_expression", "SCHEMA_VERSION"]
