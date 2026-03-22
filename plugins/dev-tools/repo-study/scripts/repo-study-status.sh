#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  repo-study-status.sh [--json] [--check-remote]

Description:
  Inspect current directory only and report:
  - whether this project was created by repo-study
  - topics and ongoing progress
  - skill packaging status (template / runnable)
  - optional remote commit check against GitHub
EOF
}

format="text"
check_remote=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --json)
      format="json"
      shift
      ;;
    --check-remote)
      check_remote=true
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unsupported option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
done

meta_file=".study-meta.json"
dir_name="$(basename "$PWD")"
name_ends_with_study=false
has_study_meta=false
created_by_repo_study=false
project_origin="plain-directory"

[[ "$dir_name" == *-study ]] && name_ends_with_study=true
[[ -f "$meta_file" ]] && has_study_meta=true

repo_name=""
repo_owner=""
repo_url=""
repo_github_url=""
repo_branch=""
repo_commit_sha=""

topics_json="[]"
remote_check_status="not_requested"
remote_check_error=""
remote_commit_sha=""
update_recommended=false
resolved_repo_owner=""
resolved_repo_name=""
remote_check_prompt=""

extract_owner_repo() {
  local input="$1"
  local tail owner repo
  tail="${input#*github.com[:/]}"
  if [[ "$tail" == "$input" ]]; then
    return 1
  fi
  owner="${tail%%/*}"
  tail="${tail#*/}"
  repo="${tail%%/*}"
  repo="${repo%.git}"
  if [[ -z "$owner" || -z "$repo" ]]; then
    return 1
  fi
  printf "%s\t%s\n" "$owner" "$repo"
}

if [[ "$has_study_meta" == true ]]; then
  if ! jq empty "$meta_file" >/dev/null 2>&1; then
    echo "Invalid JSON in $meta_file" >&2
    exit 1
  fi

  repo_name="$(jq -r '.repo.name // .repoName // empty' "$meta_file")"
  repo_owner="$(jq -r '.repo.owner // .owner // empty' "$meta_file")"
  repo_url="$(jq -r '.repo.url // .repoUrl // empty' "$meta_file")"
  repo_github_url="$(jq -r '.repo.githubUrl // .githubUrl // empty' "$meta_file")"
  repo_branch="$(jq -r '.repo.branch // .branch // empty' "$meta_file")"
  repo_commit_sha="$(jq -r '.repo.commitSha // .commitSha // empty' "$meta_file")"

  is_managed_v2="$(jq -r '(.managedBy.skill // "") == "repo-study" and (.managedBy.createdBySkill // false) == true' "$meta_file")"

  if [[ "$is_managed_v2" == true ]]; then
    created_by_repo_study=true
    project_origin="repo-study-managed"
  else
    created_by_repo_study=false
    project_origin="non-repo-study"
  fi

  topics_json="$(jq -c '
    def cnt($arr; $type): (($arr // []) | map(select(.type == $type)) | length);
    def mk_progress($t): {
      questionCount: ($t.progress.questionCount // (($t.questions // []) | length)),
      noteCount: ($t.progress.noteCount // cnt($t.artifacts; "note")),
      guideCount: ($t.progress.guideCount // cnt($t.artifacts; "guide")),
      skillTemplateCount: ($t.progress.skillTemplateCount // cnt($t.artifacts; "skill_template")),
      runnableSkillCount: ($t.progress.runnableSkillCount // cnt($t.artifacts; "runnable_skill")),
      lastActivityAt: ($t.progress.lastActivityAt // $t.updatedAt // $t.createdAt // null)
    };
    def mk_packaging($t): {
      hasSkillTemplate: ($t.skillPackaging.hasSkillTemplate // (mk_progress($t).skillTemplateCount > 0)),
      hasRunnableSkill: ($t.skillPackaging.hasRunnableSkill // (mk_progress($t).runnableSkillCount > 0))
    };
    if (.topics | type) == "array" then
      [
        .topics[] as $t |
        {
          id: ($t.id // ""),
          name: ($t.name // $t.topic // "untitled-topic"),
          category: ($t.category // "unclassified"),
          tags: ($t.tags // []),
          state: ($t.state // "active"),
          progress: mk_progress($t),
          skillPackaging: mk_packaging($t),
          questions: ($t.questions // []),
          artifacts: ($t.artifacts // [])
        }
      ]
    else
      []
    end
  ' "$meta_file")"

else
  if [[ "$name_ends_with_study" == true ]]; then
    project_origin="study-without-meta"
  fi
fi

if [[ "$check_remote" == true ]]; then
  if [[ "$created_by_repo_study" != true ]]; then
    remote_check_status="unknown"
    remote_check_error="current project is not repo-study-managed"
  else
    resolved_repo_owner="$repo_owner"
    resolved_repo_name="$repo_name"

    if [[ -z "$resolved_repo_owner" || -z "$resolved_repo_name" ]]; then
      if parsed="$(extract_owner_repo "${repo_github_url:-}")"; then
        resolved_repo_owner="${parsed%%$'\t'*}"
        resolved_repo_name="${parsed##*$'\t'}"
      elif parsed="$(extract_owner_repo "${repo_url:-}")"; then
        resolved_repo_owner="${parsed%%$'\t'*}"
        resolved_repo_name="${parsed##*$'\t'}"
      fi
    fi

    if [[ -z "$resolved_repo_owner" || -z "$resolved_repo_name" ]]; then
      remote_check_status="unknown"
      remote_check_error="unable to resolve repo owner/name from meta"
    elif ! command -v gh >/dev/null 2>&1; then
      remote_check_status="unknown"
      remote_check_error="gh CLI not found"
    else
      check_branch="${repo_branch:-main}"
      remote_result="$(gh api "repos/${resolved_repo_owner}/${resolved_repo_name}/commits/${check_branch}" --jq '.sha' 2>&1)" || true
      if [[ "$remote_result" =~ ^[0-9a-f]{40}$ ]]; then
        remote_commit_sha="$remote_result"
        if [[ -n "$repo_commit_sha" && "$remote_commit_sha" == "$repo_commit_sha" ]]; then
          remote_check_status="up_to_date"
        else
          remote_check_status="outdated"
          update_recommended=true
          remote_check_prompt="检测到远程仓库有更新，是否更新源码？"
        fi
      else
        remote_check_status="unknown"
        remote_check_error="$remote_result"
      fi
    fi
  fi
fi

topic_count="$(jq 'length' <<<"$topics_json")"
question_count="$(jq '[.[].progress.questionCount] | add // 0' <<<"$topics_json")"
note_count="$(jq '[.[].progress.noteCount] | add // 0' <<<"$topics_json")"
guide_count="$(jq '[.[].progress.guideCount] | add // 0' <<<"$topics_json")"
skill_template_count="$(jq '[.[].progress.skillTemplateCount] | add // 0' <<<"$topics_json")"
runnable_skill_count="$(jq '[.[].progress.runnableSkillCount] | add // 0' <<<"$topics_json")"

json_output="$(
  jq -cn \
    --arg currentDir "$PWD" \
    --arg projectOrigin "$project_origin" \
    --arg repoName "$repo_name" \
    --arg repoOwner "$repo_owner" \
    --arg repoUrl "$repo_url" \
    --arg repoGithubUrl "$repo_github_url" \
    --arg repoBranch "$repo_branch" \
    --arg repoCommitSha "$repo_commit_sha" \
    --arg resolvedRepoOwner "$resolved_repo_owner" \
    --arg resolvedRepoName "$resolved_repo_name" \
    --arg remoteCommitSha "$remote_commit_sha" \
    --arg remoteCheckStatus "$remote_check_status" \
    --arg remoteCheckError "$remote_check_error" \
    --arg remoteCheckPrompt "$remote_check_prompt" \
    --argjson nameEndsWithStudy "$name_ends_with_study" \
    --argjson hasStudyMeta "$has_study_meta" \
    --argjson createdByRepoStudy "$created_by_repo_study" \
    --argjson remoteCheckEnabled "$check_remote" \
    --argjson updateRecommended "$update_recommended" \
    --argjson topicCount "$topic_count" \
    --argjson questionCount "$question_count" \
    --argjson noteCount "$note_count" \
    --argjson guideCount "$guide_count" \
    --argjson skillTemplateCount "$skill_template_count" \
    --argjson runnableSkillCount "$runnable_skill_count" \
    --argjson topics "$topics_json" '
    {
      currentDir: $currentDir,
      checks: {
        nameEndsWithStudy: $nameEndsWithStudy,
        hasStudyMeta: $hasStudyMeta
      },
      projectOrigin: $projectOrigin,
      createdByRepoStudy: $createdByRepoStudy,
      repo: {
        name: (if $repoName == "" then null else $repoName end),
        owner: (if $repoOwner == "" then null else $repoOwner end),
        url: (if $repoUrl == "" then null else $repoUrl end),
        githubUrl: (if $repoGithubUrl == "" then null else $repoGithubUrl end),
        branch: (if $repoBranch == "" then null else $repoBranch end),
        commitSha: (if $repoCommitSha == "" then null else $repoCommitSha end)
      },
      summary: {
        topicCount: $topicCount,
        questionCount: $questionCount,
        noteCount: $noteCount,
        guideCount: $guideCount,
        skillTemplateCount: $skillTemplateCount,
        runnableSkillCount: $runnableSkillCount
      },
      remoteCheck: {
        enabled: $remoteCheckEnabled,
        status: $remoteCheckStatus,
        repoOwner: (if $resolvedRepoOwner == "" then null else $resolvedRepoOwner end),
        repoName: (if $resolvedRepoName == "" then null else $resolvedRepoName end),
        branch: (if $repoBranch == "" then "main" else $repoBranch end),
        localCommitSha: (if $repoCommitSha == "" then null else $repoCommitSha end),
        remoteCommitSha: (if $remoteCommitSha == "" then null else $remoteCommitSha end),
        updateRecommended: $updateRecommended,
        prompt: (if $remoteCheckPrompt == "" then null else $remoteCheckPrompt end),
        error: (if $remoteCheckError == "" then null else $remoteCheckError end)
      },
      topics: $topics
    }
  '
)"

if [[ "$format" == "json" ]]; then
  echo "$json_output"
  exit 0
fi

echo "Repo Study Status"
echo "Current Directory: $PWD"
echo "Directory Suffix (*-study): $name_ends_with_study"
echo "Study Meta (.study-meta.json): $has_study_meta"
echo "Project Origin: $project_origin"
echo "Created By repo-study: $created_by_repo_study"
echo

if [[ "$check_remote" == true ]]; then
  echo "Remote Check: $remote_check_status"
  if [[ -n "$repo_commit_sha" ]]; then
    echo "Local Commit: $repo_commit_sha"
  fi
  if [[ -n "$remote_commit_sha" ]]; then
    echo "Remote Commit: $remote_commit_sha"
  fi
  if [[ -n "$remote_check_error" ]]; then
    echo "Remote Check Error: $remote_check_error"
  fi
  if [[ "$update_recommended" == true ]]; then
    echo
    echo "Update Prompt:"
    echo "检测到远程仓库有更新，是否更新源码？"
    echo "1. 是，更新到最新版本（推荐）"
    echo "2. 否，继续使用当前版本研究"
    echo
  fi
fi

echo "Topics: $topic_count"

if [[ "$topic_count" -eq 0 ]]; then
  echo "No topic data found."
  exit 0
fi

idx=0
while IFS= read -r topic; do
  idx=$((idx + 1))
  name="$(jq -r '.name' <<<"$topic")"
  category="$(jq -r '.category' <<<"$topic")"
  qn="$(jq -r '.progress.questionCount' <<<"$topic")"
  nn="$(jq -r '.progress.noteCount' <<<"$topic")"
  gn="$(jq -r '.progress.guideCount' <<<"$topic")"
  stn="$(jq -r '.progress.skillTemplateCount' <<<"$topic")"
  rsn="$(jq -r '.progress.runnableSkillCount' <<<"$topic")"
  last_activity="$(jq -r '.progress.lastActivityAt // "n/a"' <<<"$topic")"
  has_tpl="$(jq -r '.skillPackaging.hasSkillTemplate' <<<"$topic")"
  has_run="$(jq -r '.skillPackaging.hasRunnableSkill' <<<"$topic")"

  packaging="none"
  if [[ "$has_run" == "true" ]]; then
    packaging="runnable"
  elif [[ "$has_tpl" == "true" ]]; then
    packaging="template-only"
  fi

  echo "$idx) $name [$category]"
  echo "   progress: questions=$qn notes=$nn guides=$gn skill_templates=$stn runnable_skills=$rsn"
  echo "   packaging: $packaging"
  echo "   last_activity: $last_activity"
done < <(jq -c '.[]' <<<"$topics_json")
