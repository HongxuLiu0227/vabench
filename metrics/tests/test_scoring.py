from __future__ import annotations

import unittest

from metrics.dom_snapshot import (
    choose_best_matching_mark,
    extract_view_delta,
    multiset_overlap,
    normalize_text,
    view_delta_similarity,
    view_data_similarity,
    view_state_change,
    view_state_similarity,
)
from metrics.models import MarkSnapshot, ViewSnapshot


def make_view(title: str, texts: list[str], marks: list[MarkSnapshot]) -> ViewSnapshot:
    return ViewSnapshot(
        title=title,
        order=0,
        bbox_top=0.0,
        bbox_left=0.0,
        bbox_width=400.0,
        bbox_height=300.0,
        texts=tuple(texts),
        marks=tuple(marks),
    )


class ScoringTests(unittest.TestCase):
    def test_normalize_text_canonicalizes_numbers(self) -> None:
        self.assertEqual(normalize_text(" 1,250.00 Trips "), "1250 trips")

    def test_multiset_overlap_is_reference_recall(self) -> None:
        score = multiset_overlap(["a", "a", "b"], ["a", "b", "c"])
        self.assertAlmostEqual(score, 2 / 3)

    def test_view_data_similarity_combines_text_and_geometry(self) -> None:
        reference = make_view(
            "Age Comparison",
            ["Customer", "Subscriber", "100", "200"],
            [
                MarkSnapshot(0, "rect", "", 0.2, 0.6, 0.1, 0.4, 0.04, "#4e79a7", "", 1.0),
                MarkSnapshot(1, "rect", "", 0.4, 0.5, 0.1, 0.5, 0.05, "#f28e2b", "", 1.0),
            ],
        )
        candidate = make_view(
            "Age Comparison",
            ["Customer", "Subscriber", "100", "180"],
            [
                MarkSnapshot(0, "rect", "", 0.2, 0.6, 0.1, 0.4, 0.04, "#4e79a7", "", 1.0),
                MarkSnapshot(1, "rect", "", 0.4, 0.52, 0.1, 0.48, 0.048, "#f28e2b", "", 1.0),
            ],
        )
        score = view_data_similarity(reference, candidate, text_weight=0.7, geometry_weight=0.3)
        self.assertGreater(score, 0.7)

    def test_view_state_change_detects_style_changes(self) -> None:
        before = make_view(
            "Totals",
            ["Customer", "Subscriber"],
            [
                MarkSnapshot(0, "rect", "Customer", 0.2, 0.4, 0.1, 0.2, 0.02, "#4e79a7", "", 1.0),
                MarkSnapshot(1, "rect", "Subscriber", 0.4, 0.4, 0.1, 0.6, 0.06, "#f28e2b", "", 1.0),
            ],
        )
        after = make_view(
            "Totals",
            ["Customer", "Subscriber"],
            [
                MarkSnapshot(0, "rect", "Customer", 0.2, 0.4, 0.1, 0.2, 0.02, "#4e79a7", "", 0.3),
                MarkSnapshot(1, "rect", "Subscriber", 0.4, 0.4, 0.1, 0.6, 0.06, "#f28e2b", "", 1.0),
            ],
        )
        self.assertLess(view_state_similarity(before, after), 1.0)
        self.assertGreater(view_state_change(before, after), 0.05)

    def test_choose_best_matching_mark_prefers_title_match(self) -> None:
        reference = MarkSnapshot(0, "circle", "Subscriber", 0.4, 0.3, 0.03, 0.03, 0.001, "#f28e2b", "", 1.0)
        candidates = (
            MarkSnapshot(0, "circle", "Customer", 0.4, 0.3, 0.03, 0.03, 0.001, "#4e79a7", "", 1.0),
            MarkSnapshot(1, "circle", "Subscriber", 0.42, 0.29, 0.03, 0.03, 0.001, "#f28e2b", "", 1.0),
        )
        self.assertEqual(choose_best_matching_mark(reference, candidates), candidates[1])

    def test_view_delta_similarity_uses_only_changed_marks(self) -> None:
        before = make_view(
            "Totals",
            ["Customer", "Subscriber"],
            [
                MarkSnapshot(0, "rect", "Customer", 0.2, 0.4, 0.1, 0.2, 0.02, "#4e79a7", "", 1.0),
                MarkSnapshot(1, "rect", "Subscriber", 0.4, 0.4, 0.1, 0.6, 0.06, "#f28e2b", "", 1.0),
            ],
        )
        after_ref = make_view(
            "Totals",
            ["Customer", "Subscriber"],
            [
                MarkSnapshot(0, "rect", "Customer", 0.2, 0.4, 0.1, 0.2, 0.02, "#4e79a7", "", 0.3),
                MarkSnapshot(1, "rect", "Subscriber", 0.4, 0.4, 0.1, 0.6, 0.06, "#f28e2b", "", 1.0),
            ],
        )
        after_candidate = make_view(
            "Totals",
            ["Customer", "Subscriber"],
            [
                MarkSnapshot(0, "rect", "Customer", 0.2, 0.4, 0.1, 0.2, 0.02, "#111111", "", 0.25),
                MarkSnapshot(1, "rect", "Subscriber", 0.4, 0.4, 0.1, 0.6, 0.06, "#f28e2b", "", 1.0),
            ],
        )
        reference_delta = extract_view_delta(before, after_ref)
        candidate_delta = extract_view_delta(before, after_candidate)
        self.assertEqual(reference_delta.changed_mark_count, 1)
        self.assertEqual(candidate_delta.changed_mark_count, 1)
        self.assertAlmostEqual(view_delta_similarity(reference_delta, candidate_delta), 1.0)


if __name__ == "__main__":
    unittest.main()
