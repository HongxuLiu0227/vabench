from __future__ import annotations

from agent_pipeline.agents.tableau_requirement_generation_agent import (
    derive_tableau_render_contract,
    extract_tableau_structured_spec,
    prepare_tableau_data_assets,
)


def test_extract_tableau_structured_spec_captures_required_fields():
    twb_xml = """
    <workbook>
      <actions>
        <action caption="Highlight Action" name="[Action1]">
          <activation auto-clear="true" type="on-select" />
          <source type="sheet" worksheet="Overall Rates" />
          <command command="tsc:brush">
            <param name="field-captions" value="Satisfaction Rating (group)" />
            <param name="target" value="Dashboard" />
          </command>
        </action>
      </actions>
      <worksheets>
        <worksheet name="Overall Rates">
          <layout-options>
            <title>
              <formatted-text>
                <run bold="true" fontcolor="#32779b">Safety</run>
                <run> and Performance</run>
              </formatted-text>
            </title>
          </layout-options>
          <table>
            <view>
              <datasource-dependencies>
                <column-instance name="[pcto:sum:Survey Results:qk:2]">
                  <table-calc type="PctTotal" ordering-field="[Satisfaction Rating (group)]" ordering-type="Field" />
                </column-instance>
              </datasource-dependencies>
              <manual-sort column="[none:Feature:nk]" direction="ASC">
                <dictionary>
                  <bucket>"Safety"</bucket>
                  <bucket>"Performance"</bucket>
                </dictionary>
              </manual-sort>
              <filter class="categorical" column="[none:Satisfaction Rating:nk]">
                <groupfilter function="member" member='"Very satisfied"' />
              </filter>
            </view>
            <style>
              <style-rule element="axis">
                <format attr="title" scope="cols" value="Percent of Total" field="[pcto:sum:Survey Results:qk:2]" />
              </style-rule>
              <style-rule element="legend">
                <format attr="col-width" field="[Satisfaction Rating (group)]" value="200" />
              </style-rule>
            </style>
            <panes>
              <pane>
                <mark class="Automatic" />
                <encodings>
                  <color column="[Satisfaction Rating (group)]" />
                </encodings>
              </pane>
            </panes>
            <rows>[federated].[none:Feature:nk]</rows>
            <cols>[federated].[pcto:sum:Survey Results:qk:2]</cols>
          </table>
        </worksheet>
      </worksheets>
      <dashboards>
        <dashboard name="Dashboard">
          <size minwidth="1000" minheight="800" maxwidth="1000" maxheight="800" />
          <zones>
            <zone id="4" name="Layout Root" x="0" y="0" w="100000" h="100000">
              <zone id="3" name="Overall Rates" x="800" y="1000" w="98400" h="53375" />
              <zone id="5" name="Overall Rates" type="color" param="[Satisfaction Rating (group)]" x="800" y="55000" w="98400" h="3000" />
              <zone id="6" type-v2="text" x="800" y="200" w="40000" h="3000">
                <formatted-text>
                  <run fontname="Tableau Medium" fontsize="14">Dashboard Header</run>
                </formatted-text>
              </zone>
            </zone>
          </zones>
        </dashboard>
      </dashboards>
      <windows>
        <window class="worksheet" name="Overall Rates">
          <viewpoint>
            <highlight field="[Satisfaction Rating (group)]">
              <bucket-selection />
            </highlight>
          </viewpoint>
        </window>
      </windows>
    </workbook>
    """.strip()

    spec = extract_tableau_structured_spec(twb_xml)

    assert spec["schema_version"] == "tableau_spec_v1"
    assert spec["summary"]["worksheet_count"] == 1
    assert spec["summary"]["dashboard_count"] == 1
    assert spec["summary"]["dashboard_text_zone_count"] == 1
    assert spec["summary"]["dashboard_action_count"] == 1
    assert spec["summary"]["highlight_binding_count"] == 1

    worksheet = spec["worksheets"][0]
    assert worksheet["name"] == "Overall Rates"
    assert worksheet["chart_type"] == "Automatic"
    assert worksheet["rows"]["raw"] == "[federated].[none:Feature:nk]"
    assert worksheet["cols"]["raw"] == "[federated].[pcto:sum:Survey Results:qk:2]"
    assert worksheet["table_calc"][0]["type"] == "PctTotal"
    assert worksheet["manual_sort"][0]["buckets"] == ["Safety", "Performance"]
    assert worksheet["filter"][0]["class"] == "categorical"
    assert isinstance(worksheet["reference_lines"], list)
    assert isinstance(worksheet["style_rule_elements"], list)
    assert worksheet["title_runs"][0]["style"]["fontcolor"] == "#32779b"
    assert worksheet["title_text"] == "Safety and Performance"
    assert worksheet["slices"] == []
    assert worksheet["encodings"]["color"][0]["column"] == "[Satisfaction Rating (group)]"
    assert worksheet["axis_titles"]["cols"][0]["title"] == "Percent of Total"
    assert worksheet["legend_spec"]["has_legend_rule"] is True

    assert spec["dashboard_zones"][0]["dashboard_name"] == "Dashboard"
    assert len(spec["dashboard_zones"][0]["zones"]) == 4
    assert spec["dashboard_text_zones"][0]["text"] == "Dashboard Header"
    assert spec["dashboard_actions"][0]["kind"] == "highlight_brush"
    assert spec["dashboard_actions"][0]["field_captions"] == ["Satisfaction Rating (group)"]
    assert spec["highlight_bindings"][0]["viewpoint_name"] == "Overall Rates"

    contract = derive_tableau_render_contract(spec)
    assert contract["schema_version"] == "tableau_render_contract_v1"
    assert contract["summary"]["worksheet_count"] == 1
    assert contract["summary"]["dashboard_text_zone_count"] == 1
    assert contract["summary"]["intent_counts"]["horizontal_stacked_percentage_bar"] == 1
    assert contract["summary"]["stacked_percentage_worksheets"] == ["Overall Rates"]
    assert contract["worksheets"][0]["chart_intent"] == "horizontal_stacked_percentage_bar"
    assert contract["worksheets"][0]["category_order"] == ["Safety", "Performance"]
    assert contract["worksheets"][0]["series_order"] == []
    assert contract["worksheets"][0]["stacking"]["normalized_to_percent"] is True
    assert contract["worksheets"][0]["axis_title_cols"] == ["Percent of Total"]
    assert contract["worksheets"][0]["legend"]["required"] is True
    assert contract["worksheets"][0]["legend"]["zone"]["relative_position"] == "below"
    assert contract["worksheets"][0]["zone"]["normalized"]["w_ratio"] > 0
    assert contract["worksheets"][0]["interaction"]["highlight_fields"] == ["[Satisfaction Rating (group)]"]
    assert contract["summary"]["legend_anchor_positions"]["Overall Rates"] == "below"
    assert contract["dashboard_text_zones"][0]["text"] == "Dashboard Header"


def test_derive_render_contract_uses_structure_not_example_tokens():
    spec = {
        "worksheets": [
            {
                "name": "Region Mix",
                "chart_type": "Automatic",
                "rows": {"raw": "[none:Region:nk]", "fields": ["[none:Region:nk]"]},
                "cols": {"raw": "[pcto:sum:Revenue:qk:2]", "fields": ["[pcto:sum:Revenue:qk:2]"]},
                "table_calc": [{"type": "PctTotal"}],
                "manual_sort": [
                    {"column": "[federated.ds].[none:Region:nk]", "direction": "ASC", "buckets": ["East", "West"]},
                    {"column": "[federated.ds].[none:Sentiment Bucket:nk]", "direction": "ASC", "buckets": ["Low", "Mid", "High"]},
                ],
                "filter": [],
                "title_runs": [],
                "slices": [],
                "encodings": {"color": [{"column": "[none:Sentiment Bucket:nk]"}]},
            },
            {
                "name": "Backlog by Team",
                "chart_type": "Bar",
                "rows": {"raw": "[sum:Open Tickets:qk]", "fields": ["[sum:Open Tickets:qk]"]},
                "cols": {"raw": "[none:Team:nk]", "fields": ["[none:Team:nk]"]},
                "table_calc": [],
                "manual_sort": [
                    {"column": "[federated.ds].[none:Team:nk]", "direction": "ASC", "buckets": ["A", "B", "C"]},
                ],
                "filter": [],
                "title_runs": [],
                "slices": [],
                "encodings": {},
            },
        ],
        "dashboards": [
            {
                "name": "Dashboard",
                "size": {},
                "zones": [
                    {"name": "Region Mix", "x": "0", "y": "0", "w": "100", "h": "50"},
                    {"name": "Backlog by Team", "x": "0", "y": "50", "w": "100", "h": "50"},
                ],
            }
        ],
    }

    contract = derive_tableau_render_contract(spec)
    by_name = {worksheet["name"]: worksheet for worksheet in contract["worksheets"]}

    assert by_name["Region Mix"]["chart_intent"] == "horizontal_stacked_percentage_bar"
    assert by_name["Region Mix"]["category_order"] == ["East", "West"]
    assert by_name["Region Mix"]["series_order"] == ["Low", "Mid", "High"]

    assert by_name["Backlog by Team"]["chart_intent"] == "vertical_ranked_bar"
    assert by_name["Backlog by Team"]["category_order"] == ["A", "B", "C"]

    assert contract["summary"]["intent_counts"]["horizontal_stacked_percentage_bar"] == 1
    assert contract["summary"]["intent_counts"]["vertical_ranked_bar"] == 1
    assert contract["summary"]["stacked_percentage_worksheets"] == ["Region Mix"]


def test_derive_render_contract_detects_box_plot_intent():
    spec = {
        "worksheets": [
            {
                "name": "BoxPlot of height by position",
                "chart_type": "Automatic",
                "rows": {"raw": "[none:Position:nk]", "fields": ["[none:Position:nk]"]},
                "cols": {"raw": "[sum:Height:qk]", "fields": ["[sum:Height:qk]"]},
                "table_calc": [],
                "manual_sort": [],
                "filter": [],
                "title_runs": [
                    {"text": "The BoxPlot of ", "style": {}},
                    {"text": "height", "style": {"bold": "true"}},
                ],
                "slices": [],
                "encodings": {"color": [{"column": "[none:Position:nk]"}]},
                "reference_lines": [
                    {
                        "axis-column": "[sum:Height:qk]",
                        "boxplot-whisker-type": "standard",
                        "boxplot-mark-exclusion": "true",
                    }
                ],
                "style_rule_elements": ["axis", "refboxplot"],
                "axis_titles": {"rows": [], "cols": [], "other": []},
                "legend_spec": {"has_legend_rule": False, "legend_fields": [], "legend_title": "", "legend_title_alignment": ""},
            }
        ],
        "dashboards": [{"name": "Dashboard", "size": {}, "zones": [{"name": "BoxPlot of height by position"}]}],
        "dashboard_actions": [],
        "highlight_bindings": [],
        "dashboard_text_zones": [],
    }

    contract = derive_tableau_render_contract(spec)
    worksheet = contract["worksheets"][0]
    assert worksheet["chart_intent"] == "horizontal_box_plot"
    assert any("box-and-whisker" in rule for rule in worksheet["fidelity_rules"])


def test_derive_render_contract_limits_output_to_zone_referenced_worksheets():
    spec = {
        "worksheets": [
            {
                "name": "Visible Pie",
                "chart_type": "Pie",
                "rows": {"raw": "", "fields": []},
                "cols": {"raw": "", "fields": []},
                "table_calc": [],
                "manual_sort": [],
                "filter": [],
                "title_runs": [],
                "slices": [],
                "encodings": {"wedge-size": [{"column": "[sum:Sales:qk]"}]},
                "reference_lines": [],
                "style_rule_elements": [],
                "axis_titles": {"rows": [], "cols": [], "other": []},
                "legend_spec": {"has_legend_rule": False, "legend_fields": [], "legend_title": "", "legend_title_alignment": ""},
            },
            {
                "name": "Visible Trend",
                "chart_type": "Automatic",
                "rows": {"raw": "[sum:Sales:qk]", "fields": ["[sum:Sales:qk]"]},
                "cols": {"raw": "[yr:Order Date:ok]", "fields": ["[yr:Order Date:ok]"]},
                "table_calc": [],
                "manual_sort": [],
                "filter": [],
                "title_runs": [],
                "slices": [],
                "encodings": {},
                "reference_lines": [],
                "style_rule_elements": [],
                "axis_titles": {"rows": [], "cols": [], "other": []},
                "legend_spec": {"has_legend_rule": False, "legend_fields": [], "legend_title": "", "legend_title_alignment": ""},
            },
            {
                "name": "Hidden Worksheet",
                "chart_type": "Bar",
                "rows": {"raw": "[sum:Profit:qk]", "fields": ["[sum:Profit:qk]"]},
                "cols": {"raw": "[none:Region:nk]", "fields": ["[none:Region:nk]"]},
                "table_calc": [],
                "manual_sort": [],
                "filter": [],
                "title_runs": [],
                "slices": [],
                "encodings": {},
                "reference_lines": [],
                "style_rule_elements": [],
                "axis_titles": {"rows": [], "cols": [], "other": []},
                "legend_spec": {"has_legend_rule": False, "legend_fields": [], "legend_title": "", "legend_title_alignment": ""},
            },
        ],
        "dashboards": [
            {
                "name": "Dashboard",
                "size": {},
                "zones": [
                    {"name": "Visible Pie", "x": "0", "y": "0", "w": "100", "h": "50", "zone_type": ""},
                    {"name": "Visible Trend", "x": "0", "y": "50", "w": "100", "h": "50", "zone_type": ""},
                ],
            }
        ],
        "dashboard_actions": [],
        "highlight_bindings": [],
        "dashboard_text_zones": [],
    }

    contract = derive_tableau_render_contract(spec)

    assert [item["name"] for item in contract["worksheets"]] == ["Visible Pie", "Visible Trend"]
    assert contract["summary"]["worksheet_count"] == 2
    assert contract["worksheets"][0]["dashboard_name"] == "Dashboard"


def test_derive_render_contract_prioritizes_pie_and_temporal_line_intents():
    spec = {
        "worksheets": [
            {
                "name": "AvgMoviePie",
                "chart_type": "Pie",
                "rows": {"raw": "", "fields": []},
                "cols": {"raw": "", "fields": []},
                "table_calc": [],
                "manual_sort": [],
                "filter": [],
                "title_runs": [],
                "slices": [],
                "encodings": {
                    "color": [{"column": "[none:Studio:nk]"}],
                    "wedge-size": [{"column": "[avg:gross:qk]"}],
                },
                "reference_lines": [],
                "style_rule_elements": [],
                "axis_titles": {"rows": [], "cols": [], "other": []},
                "legend_spec": {"has_legend_rule": False, "legend_fields": [], "legend_title": "", "legend_title_alignment": ""},
            },
            {
                "name": "Line chart",
                "chart_type": "Automatic",
                "rows": {"raw": "[sum:Revenue:qk]", "fields": ["[sum:Revenue:qk]"]},
                "cols": {"raw": "([yr:Order Date:ok] / [mn:Order Date:ok])", "fields": ["[yr:Order Date:ok]", "[mn:Order Date:ok]"]},
                "table_calc": [],
                "manual_sort": [],
                "filter": [],
                "title_runs": [],
                "slices": [],
                "encodings": {},
                "reference_lines": [],
                "style_rule_elements": [],
                "axis_titles": {"rows": [], "cols": [], "other": []},
                "legend_spec": {"has_legend_rule": False, "legend_fields": [], "legend_title": "", "legend_title_alignment": ""},
            },
        ],
        "dashboards": [
            {
                "name": "Dashboard",
                "size": {},
                "zones": [
                    {"name": "AvgMoviePie", "x": "0", "y": "0", "w": "100", "h": "50", "zone_type": ""},
                    {"name": "Line chart", "x": "0", "y": "50", "w": "100", "h": "50", "zone_type": ""},
                ],
            }
        ],
        "dashboard_actions": [],
        "highlight_bindings": [],
        "dashboard_text_zones": [],
    }

    contract = derive_tableau_render_contract(spec)
    by_name = {worksheet["name"]: worksheet for worksheet in contract["worksheets"]}

    assert by_name["AvgMoviePie"]["chart_intent"] == "pie_chart"
    assert by_name["Line chart"]["chart_intent"] == "line_chart"


def test_prepare_tableau_data_assets_sanitizes_special_characters_in_paths(tmp_path):
    tableau_input_dir = tmp_path / "tableau"
    data_dir = tableau_input_dir / "data"
    data_dir.mkdir(parents=True)
    (data_dir / "#TableauTemp_abc.csv").write_text("a,b\n1,2\n", encoding="utf-8")

    result = prepare_tableau_data_assets(tableau_input_dir, output_dir=tmp_path / "out", sample_rows=1)

    assert result["data_files_manifest"][0]["relative_path"] == "TableauTemp_abc.csv"
    assert result["data_files_manifest"][0]["fetch_url"] == "/data/TableauTemp_abc.csv"
    assert (tmp_path / "out" / "public" / "data" / "TableauTemp_abc.csv").exists()
